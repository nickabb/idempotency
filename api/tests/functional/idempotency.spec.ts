import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { v4 as uuid } from 'uuid'
import IdempotentRequest from 'App/Models/IdempotentRequest'

test.group('Idempotency Tests', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
  })
  group.each.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('request with the same idempotency key return the same response', async ({
    client,
    expect,
  }) => {
    const idempotencyKey = uuid()
    const response = await client
      .post('/authorizations')
      .header('X-Idempotency-Key', idempotencyKey)
    const response2 = await client
      .post('/authorizations')
      .header('X-Idempotency-Key', idempotencyKey)

    const firstResponseId = response.body()['id']
    const secondResponseId = response2.body()['id']

    response.assertStatus(200)
    expect(firstResponseId).toEqual(secondResponseId)
  })

  test('request with the different idempotency key does not return the same response', async ({
    client,
    expect,
  }) => {
    const response = await client.post('/authorizations').header('X-Idempotency-Key', uuid())
    const response2 = await client.post('/authorizations').header('X-Idempotency-Key', uuid())

    const firstResponseId = response.body()['id']
    const secondResponseId = response2.body()['id']

    response.assertStatus(200)
    expect(firstResponseId).not.toEqual(secondResponseId)
  })

  test('request without idempotency key does not create an idempotent request model', async ({
    client,
    expect,
  }) => {
    const response = await client.post('/authorizations')
    const idempotentRequest = await IdempotentRequest.first()

    expect(idempotentRequest).toBeNull()
    response.assertStatus(200)
  })
})
