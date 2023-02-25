import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'idempotent_requests'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('locked_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
