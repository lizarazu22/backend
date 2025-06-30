const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error('Falta la clave de OpenAI en .env');
  process.exit(1);
}

if (!process.env.OPENAI_API_BASE_URL) {
  console.error('Falta el endpoint de OpenAI en .env');
  process.exit(1);
}

const openai = axios.create({
  baseURL: process.env.OPENAI_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

module.exports = openai;
