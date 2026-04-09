import { createClient, RedisClient } from 'redis'
import { config } from './env'
import { logger } from '@/common/utils/logger'

let redisClient: RedisClient | null = null

export async function connectRedis(): Promise<RedisClient> {
  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = createClient({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
    })

    redisClient.on('error', (err: Error) => {
      logger.error('Redis client error:', err)
    })

    redisClient.on('connect', () => {
      logger.info('Redis client connected')
    })

    redisClient.on('ready', () => {
      logger.info('Redis client ready')
    })

    return redisClient
  } catch (error) {
    logger.error('Failed to connect to Redis:', error)
    throw error
  }
}

export function getRedisClient(): RedisClient {
  if (!redisClient) {
    throw new Error('Redis client not initialized')
  }
  return redisClient
}

export async function set(
  key: string,
  value: any,
  ttl?: number
): Promise<void> {
  const client = getRedisClient()
  const serialized = JSON.stringify(value)

  if (ttl) {
    await client.setex(key, ttl, serialized)
  } else {
    await client.set(key, serialized)
  }
}

export async function get(key: string): Promise<any | null> {
  const client = getRedisClient()
  const value = await client.get(key)

  if (value === null) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

export async function del(key: string): Promise<number> {
  const client = getRedisClient()
  return new Promise((resolve, reject) => {
    client.del(key, (err, reply) => {
      if (err) reject(err)
      else resolve(reply || 0)
    })
  })
}

export async function exists(key: string): Promise<boolean> {
  const client = getRedisClient()
  return new Promise((resolve, reject) => {
    client.exists(key, (err, reply) => {
      if (err) reject(err)
      else resolve((reply || 0) > 0)
    })
  })
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    logger.info('Redis connection closed')
  }
}
