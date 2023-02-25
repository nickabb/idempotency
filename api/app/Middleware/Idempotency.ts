import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import IdempotentRequest from 'App/Models/IdempotentRequest'

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
      }
    )

    if (idempotentRequest.$isLocal) {
      response.response.on('finish', () => {
        idempotentRequest.responseBody = JSON.stringify(response.getBody())
        idempotentRequest.responseStatusCode = response.getStatus()
        idempotentRequest.save()
      })
      await next()
    } else {
      return response
        .status(idempotentRequest.responseStatusCode)
        .send(idempotentRequest.responseBody)
    }
  }
}
