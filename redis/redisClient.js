const redis = require('redis');
const client = redis.createClient();

client.on('connect', () => console.log(' Redis connected!'));
client.on('error', err => console.error(' Redis Error:', err));

client.connect(); 

module.exports = client;
