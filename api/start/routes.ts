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

import Route from '@ioc:Adonis/Core/Route'
import axios from 'axios'

const OUR_API = 'http://adonis_app:3333'
const HELP_DESK_API = 'http://external_api:8080'

Route.get('/', async () => {
  await axios.post(
    `${HELP_DESK_API}/document`,
    { documentUrl: 'https://boot.dev/community' },
    { headers: { 'X-Callback-Url': `${OUR_API}/document/update` } }
  )
})

Route.group(() => {
  Route.post('authorizations', 'AuthorizationsController.process')
})
