// index.js
const express = require('express');
const client = require('./redisClient');
const { getUserFromDB } = require('./db');

const app = express();
const PORT = 3000;

app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  const cacheKey = `user:${userId}`;

  try {
    // 1. Check Redis cache
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      console.log(' Returning from Redis cache');
      return res.json(JSON.parse(cachedData));
    }

    // 2. If not in cache, get from fake DB
    const user = await getUserFromDB(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Save to Redis with 60 seconds expiry
    await client.set(cacheKey, JSON.stringify(user), {
      EX: 60
    });

    console.log(' Fetched from DB & cached');
    res.json(user);

  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
