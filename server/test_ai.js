const dotenv = require('dotenv');
const path = require('path');

// Load server .env
dotenv.config({ path: path.join(__dirname, '.env') });

const aiService = require('./services/aiService');

(async () => {
  try {
    const sample = "Need to finish the project report by Friday. Schedule a meeting with the team next week. Buy groceries tomorrow and call the bank about the loan reminder.";
    console.log('Running AI test with sample journal:', sample);
    const res = await aiService.generateTasksFromJournal(sample);
    console.log('AI Test Result:\n', JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('AI Test Error:', err);
    process.exit(2);
  }
})();
