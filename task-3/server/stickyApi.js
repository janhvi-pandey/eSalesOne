const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const auth = Buffer.from(`${process.env.STICKY_API_USER}:${process.env.STICKY_API_PASSWORD}`).toString('base64');

const stickyApi = axios.create({
  baseURL: process.env.STICKY_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`
  }
});
// console.log("Sticky",stickyApi);

module.exports = stickyApi;
