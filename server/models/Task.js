const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  dueDate: { type: Date, default: null },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED'],
    default: 'PENDING'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  source: { type: String, enum: ['user', 'ai'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
