/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Redis from '@ioc:Adonis/Addons/Redis'
import Route from '@ioc:Adonis/Core/Route'
import axios from 'axios'
import { v4 as uuid } from 'uuid'

Route.post('/document', async ({ request, response }) => {
  const webhookDestination = request.header('X-Callback-Url')
  if (webhookDestination) {
    const agentId = uuid().toString()
    const documentId = uuid().toString()

    // Publish to a queue, so we can respond to the HTTP call immediately.
    // This is consumed by "document-subscriber.ts"
    await Redis.publish(
      'documents',
      JSON.stringify({
        id: request.body().id,
        agentId,
        documentId,
        webhookDestination,
      })
    )

    return response.ok({ agentId: agentId, documentId: documentId })
  }
  return response.badRequest({ message: 'Missing X-Callback-Url - is it spelled correctly?' })
})

Route.post('/callback-url', async ({ request, response }) => {
  const webhookDestination = request.header('X-Callback-Url')
  if (webhookDestination) {
    await axios.post(webhookDestination, { id: request.body().id })
    return response.ok({ message: 'success' })
  }
  return response.badRequest({ message: 'Missing X-Callback-Url - is it spelled correctly?' })
})

Route.post('/route-yourself', async ({ request, response }) => {
  const metadata = request.body().metadata
  if (!metadata) {
    return response.badRequest({ message: 'Missing metadata - is it spelled correctly?' })
  }
  // This webhook is typically configured in some type of Admin Panel. In this case, we're just going to hardcode.
  await axios.post('http://adonis_app:3333/webhook', {
    id: request.body().id,
    metadata: metadata,
  })
  return response
})

Route.post('/lookup-and-route-yourself', async ({ request, response }) => {
  if (!request.hasBody() || !request.body().id) {
    return response.badRequest({ message: 'Missing body or missing ID field' })
  }
  // This webhook is typically configured in some type of Admin Panel. In this case, we're just going to hardcode.
  await axios.post('http://adonis_app:3333/webhook', { id: request.body().id })
  return { id: request.body().id }
})
