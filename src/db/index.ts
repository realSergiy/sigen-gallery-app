import 'server-only';

import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

// ToDo: replace with prisma and prisma accelerate (free tier, supports edge functions)
// https://www.prisma.io/docs/accelerate/getting-started
export const db = drizzle({ client: sql, logger: true });
