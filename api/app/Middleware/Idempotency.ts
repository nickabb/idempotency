import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import IdempotentRequest from 'App/Models/IdempotentRequest'
import { DateTime } from 'luxon'

export default class Idempotency {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const idempotencyKey = request.header('X-Idempotency-Key')
    const resourcePath = request.url(false)

    if (!idempotencyKey) {
      await next()
      return
    }

    /**
     * Edge cases to consider in your own implementation:
     * 1. We do not validate that the request body or parameters are the same.  In some systems,
     * they will explicitly throw an error code to indicate a re-used idempotency key.
     * 2. We are allowing failures to be retried with the same idempotency key. Some systems (eg Stripe)
     * will always return a 500 for a given idempotency key if that is returned for the first request,
     * even if the cause of the error is resolved before the time of the retry.
     * 3. We are not validating the format of the key.  In a real production system you would probably want
     * to validate the format, as it is coming from an external party
     */

    const idempotentRequest = await IdempotentRequest.firstOrCreate(
      { idempotencyKey: idempotencyKey },
      {
        idempotencyKey,
        resourcePath: resourcePath,
        lockedAt: DateTime.fromJSDate(new Date()),
      }
    )

    // There is no existing idempotent request stored.
    if (idempotentRequest.$isLocal) {
      response.response.on('finish', () => {
        idempotentRequest.responseBody = JSON.stringify(response.getBody())
        idempotentRequest.responseStatusCode = response.getStatus()
        idempotentRequest.save()
      })
      await next()

      // There is an existing idempotent request.
    } else {
      const thirtySecondsAfterOriginalRequest = idempotentRequest.lockedAt.plus({ seconds: 30 })
      const now = DateTime.fromJSDate(new Date())

      // The first request is not done processing yet!
      if (!idempotentRequest.responseBody && thirtySecondsAfterOriginalRequest > now) {
        return response.status(429)
      } else if (!idempotentRequest.responseBody) {
        response.response.on('finish', () => {
          idempotentRequest.responseBody = JSON.stringify(response.getBody())
          idempotentRequest.responseStatusCode = response.getStatus()
          idempotentRequest.save()
        })
        await next()
        return
      }

      return response
        .status(idempotentRequest.responseStatusCode)
        .send(idempotentRequest.responseBody)
    }
  }
}
