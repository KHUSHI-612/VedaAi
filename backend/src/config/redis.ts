import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not defined in .env');
}

/**
 * Configure and instantiate Redis client with parameters suitable for BullMQ.
 * BullMQ requires maxRetriesPerRequest: null to function correctly.
 */
export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Setup event listeners for logging
redisClient.on('connect', () => {
  console.log('Redis connected successfully.');
});

redisClient.on('error', (error) => {
  console.error('Redis connection error:', error);
});

/**
 * Returns the active Redis client instance.
 */
export const getRedis = (): Redis => {
  return redisClient;
};
