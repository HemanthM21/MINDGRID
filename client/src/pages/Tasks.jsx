import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  
  // AI Journal states
  const [showAIJournal, setShowAIJournal] = useState(false)
  const [journalText, setJournalText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPreview, setAiPreview] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState({})

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    try {
      setLoading(true)
      const res = await api.get('/tasks')
      if (res.data && res.data.tasks) setTasks(res.data.tasks)
    } finally {
      setLoading(false)
    }
  }

  async function add() {
    if (!title.trim()) {
      alert('Please enter a task title')
      return
    }

    try {
      await api.post('/tasks', {
        title,
        description: description || null,
        dueDate: dueDate || null,
        priority
      })
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('MEDIUM')
      fetchTasks()
    } catch (err) {
      alert('Error creating task: ' + err.message)
    }
  }

  async function analyzeJournal() {
    if (!journalText.trim()) {
      alert('Please write something in your journal')
      return
    }

    try {
      setAiLoading(true)
      const res = await api.post('/tasks/ai-journal', {
        journalText: journalText
      })
      
      if (res.data && res.data.preview) {
        setAiPreview(res.data.preview)
        // Initialize all tasks as selected
        const initialSelected = {}
        res.data.preview.tasks.forEach((_, idx) => {
          initialSelected[idx] = true
        })
        setSelectedTasks(initialSelected)
      }
    } catch (err) {
      alert('Error analyzing journal: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  async function confirmAITasks() {
    const tasksToCreate = aiPreview.tasks.filter((_, idx) => selectedTasks[idx])
    
    if (tasksToCreate.length === 0) {
      alert('Please select at least one task')
      return
    }

    try {
      setAiLoading(true)
      await api.post('/tasks/ai-journal/confirm', {
        tasks: tasksToCreate
      })
      
      setJournalText('')
      setAiPreview(null)
      setSelectedTasks({})
      setShowAIJournal(false)
      fetchTasks()
    } catch (err) {
      alert('Error creating tasks: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  async function toggleTask(id, currentStatus) {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    try {
      await api.put(`/tasks/${id}`, { status: newStatus })
      fetchTasks()
    } catch (err) {
      alert('Error updating task')
    }
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${id}`)
      fetchTasks()
    } catch (err) {
      alert('Error deleting task')
    }
  }

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter.toUpperCase())

  return (
    <div style={{ fontFamily: '"Outfit", sans-serif' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fffbf0 100%)', border: 'none' }}>
        <h2 style={{ fontSize: 32, marginBottom: 30, background: 'linear-gradient(45deg, #674846, #8a5c5a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ✓ Your Tasks
        </h2>

        {/* AI Journal Feature */}
        {!showAIJournal && !aiPreview && (
          <motion.button
            onClick={() => setShowAIJournal(true)}
            style={{
              width: '100%',
              padding: '16px 24px',
              marginBottom: 24,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #8a5c5a 0%, #674846 100%)',
              color: 'white',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(103, 72, 70, 0.3)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🤖 AI-Assisted: Generate tasks from journal
          </motion.button>
        )}

        {/* AI Journal Input Panel */}
        <AnimatePresence>
          {showAIJournal && !aiPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginBottom: 32,
                padding: 24,
                background: 'linear-gradient(135deg, rgba(138, 92, 90, 0.05) 0%, rgba(103, 72, 70, 0.05) 100%)',
                backdropFilter: 'blur(12px)',
                borderRadius: 16,
                border: '2px solid rgba(138, 92, 90, 0.2)',
                boxShadow: '0 8px 32px rgba(103, 72, 70, 0.1)'
              }}
            >
              <h3 style={{ marginBottom: 16, color: '#674846', fontSize: 18, fontWeight: 600 }}>
                ✍️ Share Your Thoughts
              </h3>
              <p style={{ marginBottom: 16, color: '#718096', fontSize: 14 }}>
                Write about your day, what's on your mind, or what you need to get done. AI will extract actionable tasks for you.
              </p>
              
              <textarea
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                placeholder="Write about your day, your goals, or what's on your mind. E.g., 'Need to finish the project report by Friday. Also want to schedule a meeting with the team and buy groceries. I should also review the budget for next month...'"
                rows="6"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '2px solid rgba(103, 72, 70, 0.2)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 14,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  marginBottom: 16
                }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={analyzeJournal}
                  disabled={aiLoading}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #8a5c5a 0%, #674846 100%)',
                    color: 'white',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                    opacity: aiLoading ? 0.7 : 1,
                    boxShadow: '0 4px 12px rgba(103, 72, 70, 0.2)'
                  }}
                >
                  {aiLoading ? '🤖 Analyzing...' : '✨ Analyze with AI'}
                </button>
                <button
                  onClick={() => {
                    setShowAIJournal(false)
                    setJournalText('')
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 12,
                    background: 'rgba(103, 72, 70, 0.1)',
                    color: '#674846',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Preview Panel */}
        <AnimatePresence>
          {aiPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginBottom: 32,
                padding: 24,
                background: 'linear-gradient(135deg, #fffbf0 0%, rgba(255, 255, 255, 0.9) 100%)',
                borderRadius: 16,
                border: '2px solid rgba(138, 92, 90, 0.2)',
                boxShadow: '0 8px 32px rgba(103, 72, 70, 0.1)'
              }}
            >
              <h3 style={{ marginBottom: 8, color: '#674846', fontSize: 18, fontWeight: 600 }}>
                📋 Suggested Tasks
              </h3>
              {aiPreview.summary && (
                <p style={{ marginBottom: 16, color: '#718096', fontSize: 14 }}>
                  <strong>Summary:</strong> {aiPreview.summary}
                </p>
              )}

              {/* Journal Analysis: Mood / Priorities / Stress / Events */}
              {(aiPreview.mood || (aiPreview.priorities && aiPreview.priorities.length) || (aiPreview.stressFactors && aiPreview.stressFactors.length) || (aiPreview.importantEvents && aiPreview.importantEvents.length)) && (
                <div style={{ marginBottom: 16, padding: 12, background: '#f7fafc', borderRadius: 12, border: '1px solid rgba(0,0,0,0.04)' }}>
                  {aiPreview.mood && (
                    <p style={{ margin: '6px 0', fontSize: 14 }}><strong>🧠 Mood:</strong> {aiPreview.mood}</p>
                  )}

                  {aiPreview.priorities && aiPreview.priorities.length > 0 && (
                    <p style={{ margin: '6px 0', fontSize: 14 }}><strong>🎯 Priorities:</strong> {aiPreview.priorities.join(', ')}</p>
                  )}

                  {aiPreview.stressFactors && aiPreview.stressFactors.length > 0 && (
                    <p style={{ margin: '6px 0', fontSize: 14 }}><strong>⚠️ Stress Factors:</strong> {aiPreview.stressFactors.join(', ')}</p>
                  )}

                  {aiPreview.importantEvents && aiPreview.importantEvents.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ margin: '6px 0', fontSize: 14 }}><strong>📌 Important Events:</strong></p>
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {aiPreview.importantEvents.map((ev, i) => (
                          <li key={i} style={{ fontSize: 13, marginBottom: 4 }}>{ev.date ? `${new Date(ev.date).toLocaleDateString()}: ` : ''}{ev.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tasks Checkboxes */}
              <div style={{ marginBottom: 20 }}>
                {aiPreview.tasks.map((task, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      padding: 16,
                      marginBottom: 12,
                      background: 'white',
                      borderRadius: 12,
                      border: selectedTasks[idx] ? '2px solid #8a5c5a' : '2px solid rgba(103, 72, 70, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setSelectedTasks(prev => ({
                      ...prev,
                      [idx]: !prev[idx]
                    }))}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <input
                        type="checkbox"
                        checked={selectedTasks[idx] || false}
                        onChange={() => {}}
                        style={{
                          marginTop: 4,
                          cursor: 'pointer',
                          width: 20,
                          height: 20
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <strong style={{ fontSize: 16, color: '#2d3748' }}>
                            {task.title}
                          </strong>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: 0.5,
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: task.priority === 'HIGH' ? '#fed7d7' : task.priority === 'MEDIUM' ? '#feebc8' : '#c6f6d5',
                            color: task.priority === 'HIGH' ? '#c53030' : task.priority === 'MEDIUM' ? '#c05621' : '#22543d'
                          }}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p style={{ fontSize: 14, color: '#718096', marginBottom: 8 }}>
                            {task.description}
                          </p>
                        )}
                        {task.dueDate && (
                          <p style={{ fontSize: 13, color: '#ed8936' }}>
                            📅 Due: {new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        )}
                        {task.reason && (
                          <p style={{ fontSize: 12, color: '#a0aec0', fontStyle: 'italic', marginTop: 8 }}>
                            💡 {task.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Follow-up Questions */}
              {aiPreview.followUpQuestions && aiPreview.followUpQuestions.length > 0 && (
                <div style={{
                  marginBottom: 20,
                  padding: 16,
                  background: '#fffaf0',
                  borderRadius: 12,
                  border: '1px solid #fed7aa'
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#c05621', marginBottom: 8 }}>
                    ❓ Follow-up Questions:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 20, color: '#744210' }}>
                    {aiPreview.followUpQuestions.map((q, idx) => (
                      <li key={idx} style={{ fontSize: 13, marginBottom: 4 }}>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={confirmAITasks}
                  disabled={aiLoading || Object.values(selectedTasks).every(v => !v)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #38a169 0%, #22543d 100%)',
                    color: 'white',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: Object.values(selectedTasks).every(v => !v) || aiLoading ? 'not-allowed' : 'pointer',
                    opacity: Object.values(selectedTasks).every(v => !v) || aiLoading ? 0.5 : 1,
                    boxShadow: '0 4px 12px rgba(34, 84, 61, 0.2)'
                  }}
                >
                  {aiLoading ? '⏳ Creating...' : '✅ Create Selected Tasks'}
                </button>
                <button
                  onClick={() => {
                    setAiPreview(null)
                    setJournalText('')
                    setShowAIJournal(false)
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 12,
                    background: 'rgba(103, 72, 70, 0.1)',
                    color: '#674846',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Task Form */}
        {!showAIJournal && !aiPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              marginBottom: 32,
              padding: 24,
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 32px rgba(103, 72, 70, 0.05)'
            }}
          >
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: '#2d3748' }}>
              ➕ Create Task Manually
            </h3>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                onKeyPress={e => e.key === 'Enter' && add()}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '2px solid rgba(103, 72, 70, 0.1)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 16,
                  transition: 'all 0.3s ease'
                }}
              />
              <button
                onClick={add}
                style={{
                  width: 'auto',
                  whiteSpace: 'nowrap',
                  padding: '0 32px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(103, 72, 70, 0.2)'
                }}
              >
                + New Task
              </button>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1, display: 'flex', gap: 16 }}>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: '2px solid rgba(103, 72, 70, 0.1)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500
                  }}
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>

                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: '2px solid rgba(103, 72, 70, 0.1)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              rows="2"
              style={{
                width: '100%',
                marginTop: 16,
                padding: '16px 20px',
                borderRadius: 12,
                border: '2px solid rgba(103, 72, 70, 0.1)',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: 14,
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </motion.div>
        )}

        {/* Filter Buttons */}
        {!showAIJournal && !aiPreview && (
          <div className="form-group" style={{ marginBottom: 24, display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {['all', 'pending', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  width: 'auto',
                  padding: '8px 20px',
                  borderRadius: 20,
                  fontSize: 14,
                  background: filter === f ? 'var(--primary)' : 'rgba(103, 72, 70, 0.1)',
                  color: filter === f ? 'white' : 'var(--primary)',
                  border: 'none',
                  boxShadow: filter === f ? '0 4px 12px rgba(103, 72, 70, 0.2)' : 'none'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span style={{ marginLeft: 8, opacity: 0.8, fontSize: 12 }}>
                  {f === 'all' ? tasks.length : tasks.filter(t => t.status === f.toUpperCase()).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Task List */}
        {!showAIJournal && !aiPreview && (
          <>
            {loading ? (
              <div className="loading" style={{ margin: '60px 0' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: 16, color: '#999' }}>Loading your tasks...</p>
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state"
                style={{ padding: '60px 0', opacity: 0.7 }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                <p>No tasks found. Time to relax or start something new!</p>
              </motion.div>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <AnimatePresence>
                  {filtered.map(t => (
                    <motion.li
                      key={t._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 24,
                        background: 'white',
                        borderRadius: 16,
                        border: '1px solid rgba(0,0,0,0.03)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                        marginBottom: 0
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <strong style={{
                            fontSize: 18,
                            textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none',
                            color: t.status === 'COMPLETED' ? '#999' : '#2d3748',
                            transition: 'all 0.3s ease'
                          }}>
                            {t.title}
                          </strong>
                          <span className={`priority-${(t.priority || 'MEDIUM').toLowerCase()}`} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, letterSpacing: 0.5 }}>
                            {t.priority}
                          </span>
                          {t.source === 'ai' && (
                            <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, letterSpacing: 0.5, background: '#c3dafe', color: '#2c3e50' }}>
                              🤖 AI
                            </span>
                          )}
                        </div>

                        {t.description && (
                          <div style={{ fontSize: 14, color: '#718096', marginBottom: 12, lineHeight: 1.5 }}>
                            {t.description}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          {t.dueDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#718096' }}>
                              <span>📅</span>
                              {new Date(t.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                          )}

                          <div style={{
                            fontSize: 12,
                            color: t.status === 'COMPLETED' ? '#38a169' : '#ed8936',
                            fontWeight: 600,
                            background: t.status === 'COMPLETED' ? '#f0fff4' : '#fffaf0',
                            padding: '4px 10px',
                            borderRadius: 20
                          }}>
                            {t.status}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginLeft: 24 }}>
                        <button
                          className="secondary"
                          onClick={() => toggleTask(t._id, t.status)}
                          style={{
                            padding: '10px',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: t.status === 'COMPLETED' ? '#38a169' : 'white',
                            color: t.status === 'COMPLETED' ? 'white' : '#38a169',
                            borderColor: '#38a169'
                          }}
                          title={t.status === 'COMPLETED' ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          {t.status === 'COMPLETED' ? '↩' : '✓'}
                        </button>
                        <button
                          className="danger"
                          onClick={() => deleteTask(t._id)}
                          style={{
                            padding: '10px',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.8
                          }}
                          title="Delete Task"
                        >
                          🗑️
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}
