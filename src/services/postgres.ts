import { POSTGRES_SSL_ENABLED } from '@/site/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ...(POSTGRES_SSL_ENABLED && { ssl: true }),
});

export type Primitive = string | number | boolean | undefined | null;

export const query = async <T extends QueryResultRow = Record<string, unknown>>(
  queryString: string,
  values: Primitive[] = [],
) => {
  const client = await pool.connect();
  let response: QueryResult<T>;
  try {
    response = await client.query<T>(queryString, values);
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
  return response;
};

export const sql = <T extends QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: Primitive[]
) => {
  if (!isTemplateStringsArray(strings) || !Array.isArray(values)) {
    throw new Error('Invalid template literal argument');
  }

  let result = strings[0] ?? '';

  for (let index = 1; index < strings.length; index++) {
    result += `$${index}${strings[index] ?? ''}`;
  }

  return query<T>(result, values);
};

export const convertArrayToPostgresString = (
  array?: string[],
  type: 'braces' | 'brackets' | 'parentheses' = 'braces',
) =>
  array
    ? type === 'braces'
      ? `{${array.join(',')}}`
      : type === 'brackets'
        ? `[${array.map(index => `'${index}'`).join(',')}]`
        : `(${array.map(index => `'${index}'`).join(',')})`
    : null;

const isTemplateStringsArray = (strings: unknown): strings is TemplateStringsArray => {
  return Array.isArray(strings) && 'raw' in strings && Array.isArray(strings.raw);
};

export const testDatabaseConnection = async () => query('SELECt COUNT(*) FROM pg_stat_user_tables');
