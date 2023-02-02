import { Client } from "pg";

const client: Client = new Client({
  user: "hsluc",
  password: "lhspost99",
  host: "localhost",
  database: "entrega_s2",
  port: 5432,
});

const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("Database connected!");
};

export { client, startDatabase };
