import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'idempotent_requests'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.string('idempotency_key')
      table.string('resource_path')
      table.jsonb('response_body')
      table.integer('response_status_code')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
