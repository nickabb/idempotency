import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { v4 as uuid } from 'uuid'
export default class AuthorizationsController {
  public async process({}: HttpContextContract) {
    return {
      id: uuid(),
      status: 'success',
    }
  }
}
