const dotenv = require('dotenv');
const path = require('path');
const https = require('https');

dotenv.config({ path: path.join(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('GEMINI_API_KEY not set in .env');
  process.exit(2);
}

const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

console.log('Calling ListModels REST endpoint...');

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models && Array.isArray(json.models)) {
        console.log(`Found ${json.models.length} models:`);
        json.models.forEach(m => {
          console.log('- ' + (m.name || m.model || m.id) + (m.supportedMethods ? ` | methods: ${m.supportedMethods.join(',')}` : ''));
        });
      } else {
        console.log('Response:', JSON.stringify(json, null, 2));
      }
    } catch (err) {
      console.error('Failed to parse response:', err.message);
      console.error('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
