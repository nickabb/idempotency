import { test } from '@japa/runner'

test('test1', async ({ client }) => {
  const response = await client.get('/')

  response.assertStatus(200)
  response.assertBodyContains({ hello: 'world' })
})

test('test2', async ({ client }) => {
  const response = await client.get('/')

  response.assertStatus(200)
  response.assertBodyContains({ hello: 'world' })
})
