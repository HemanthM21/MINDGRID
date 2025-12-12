const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not set in .env');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log('Calling ListModels...');

    // Attempt to call a few likely methods for listing models
    if (typeof genAI.listModels === 'function') {
      const res = await genAI.listModels();
      console.log('listModels result:', JSON.stringify(res, null, 2));
      return;
    }

    if (typeof genAI.getModels === 'function') {
      const res = await genAI.getModels();
      console.log('getModels result:', JSON.stringify(res, null, 2));
      return;
    }

    // Fallback: try calling the underlying client if exposed
    if (genAI.client && typeof genAI.client.listModels === 'function') {
      const res = await genAI.client.listModels();
      console.log('client.listModels result:', JSON.stringify(res, null, 2));
      return;
    }

    console.warn('No known listModels method found on GoogleGenerativeAI instance.');
  } catch (err) {
    console.error('Error listing models:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
  }
}

listModels();
