const axios = require('axios');
require('dotenv').config();

(async () => {
  try {
    const response = await axios.post(`${process.env.OPENAI_API_BASE_URL}/chat/completions`, {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Dame una lista de productos' },
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error);
  }
})();
