/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import Redis from '@ioc:Adonis/Addons/Redis'
import axios from 'axios'

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

Redis.subscribe('documents', async (payload: string) => {
  const decoded = JSON.parse(payload)
  const { id, agentId, documentId, webhookDestination } = decoded

  await sleep(Math.random() * (10000 - 5000) + 5000)

  await axios.post(webhookDestination, {
    id: id,
    agentId,
    documentId,
  })
})
