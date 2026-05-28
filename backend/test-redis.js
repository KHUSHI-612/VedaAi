const Redis = require('ioredis');
const redisUrl = 'rediss://default:gQAAAAAAAYvcAAIgcDExYjJkZTRhMTZlYWI0YzQ2OThhZDFmZWFmYTI5MzgwNg@adequate-elf-101340.upstash.io:6379';

async function test() {
  const client = new Redis(redisUrl);
  client.on('error', (err) => console.error('Redis error:', err));
  try {
    const res = await client.ping();
    console.log('Redis Ping:', res);
  } catch (err) {
    console.error('Ping failed:', err);
  } finally {
    client.quit();
  }
}
test();
