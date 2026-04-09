import { Pool, PoolClient } from 'pg'
import { config } from './env'
import { logger } from '@/common/utils/logger'

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
})

pool.on('error', (err: Error) => {
  logger.error('Unexpected error on idle client', err)
})

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    logger.info(`Database connected at ${result.rows[0].now}`)
    client.release()
  } catch (error) {
    logger.error('Failed to connect to database:', error)
    process.exit(1)
  }
}

export async function query(text: string, params?: any[]): Promise<any> {
  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    logger.error('Database query error:', error)
    throw error
  }
}

export async function queryOne(text: string, params?: any[]): Promise<any> {
  const result = await query(text, params)
  return result.rows[0]
}

export async function queryAll(text: string, params?: any[]): Promise<any[]> {
  const result = await query(text, params)
  return result.rows
}

export async function execute(text: string, params?: any[]): Promise<number> {
  const result = await query(text, params)
  return result.rowCount || 0
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect()
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end()
  logger.info('Database connection closed')
}

export { pool }
