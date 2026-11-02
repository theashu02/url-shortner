/**
 * DIP: services depend on this abstraction, never on mongoose directly.
 * Single implementation below wraps the existing cached connection helper.
 */
export interface IDatabase {
  connect(): Promise<unknown>;
}

export class MongooseDatabase implements IDatabase {
  async connect(): Promise<unknown> {
    const { connectToDatabase } = await import("@/server/db/mongoose");
    return connectToDatabase();
  }
}
