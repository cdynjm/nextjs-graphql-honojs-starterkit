import { sql } from 'drizzle-orm';
import { mysqlTable, serial, varchar, datetime, int } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).unique(),
  password: varchar({ length: 255 }),
  role: int(),
  photo: varchar({length: 255}),
  created_at: datetime({ mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  updated_at: datetime({ mode: 'string', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`)
});
