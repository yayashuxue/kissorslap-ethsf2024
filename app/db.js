import { PrismaClient } from "@prisma/client";

export let db;
export let rawDb;

if (process.env.NODE_ENV === "production") {
  rawDb = new PrismaClient();
  db = rawDb.$extends({});
} else {
  if (!global.__rawDb) {
    global.__rawDb = process.env.LOG_PRISMA
      ? new PrismaClient({ log: ["query"] })
      : new PrismaClient();
  }
  rawDb = global.__rawDb;

  // Initialize `global.__db` if it hasn't been set
  if (!global.__db) {
    global.__db = rawDb.$extends({});
  }

  db = global.__db;
}

export default db;
