import { test } from '@japa/runner'
import { v4 as uuid } from 'uuid'

test('request with the same idempotent key return the same response', async ({
  client,
  expect,
}) => {
  const idempotencyKey = uuid()
  const response = await client.post('/authorizations').header('X-Idempotency-Key', idempotencyKey)
  const response2 = await client.post('/authorizations').header('X-Idempotency-Key', idempotencyKey)

  const firstResponseId = response.body()['id']
  const secondResponseId = response2.body()['id']

  response.assertStatus(200)
  expect(firstResponseId).toEqual(secondResponseId)
})
