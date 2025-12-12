import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import {
  CheckCircle, Clock, AlertTriangle, FileText,
  TrendingUp, MessageCircle, X, Send, Activity
} from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
const PRIORITY_COLORS = {
  HIGH: '#f56565',
  MEDIUM: '#ed8936',
  LOW: '#48bb78'
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your LifeOS assistant. How can I help you organize today?", sender: 'bot' }
  ])

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/tasks/dashboard/summary')
      if (res.data && res.data.summary) setSummary(res.data.summary)
    } catch (err) {
      console.warn('Dashboard load error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) return
    const userMsg = { text: chatMessage, sender: 'user' }
    setMessages(prev => [...prev, userMsg])
    setChatMessage('')

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "I've noted that. Is there anything else you'd like to check?",
        sender: 'bot'
      }])
    }, 1000)
  }

  if (loading) return (
    <div className="loading" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
    </div>
  )

  if (!summary) return null

  // Prepare chart data
  const priorityData = [
    { name: 'High', value: summary.highPriority || 0 },
    { name: 'Medium', value: (summary.total - (summary.highPriority || 0)) / 2 }, // Approximation for demo if data missing
    { name: 'Low', value: (summary.total - (summary.highPriority || 0)) / 2 }
  ].filter(d => d.value > 0)

  const statusData = [
    { name: 'Pending', value: summary.pending, fill: '#ed8936' },
    { name: 'Completed', value: summary.completed, fill: '#48bb78' }
  ]

  return (
    <div style={{ fontFamily: '"Outfit", sans-serif', paddingBottom: 80 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 32, marginBottom: 8, background: 'linear-gradient(45deg, #674846, #8a5c5a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Dashboard Overview
        </h2>
        <p style={{ color: '#666' }}>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
        {[
          { label: 'Total Tasks', value: summary.total, icon: FileText, color: '#4299e1', bg: '#ebf8ff' },
          { label: 'Pending', value: summary.pending, icon: Clock, color: '#ed8936', bg: '#fffaf0' },
          { label: 'Completed', value: summary.completed, icon: CheckCircle, color: '#48bb78', bg: '#f0fff4' },
          { label: 'High Priority', value: summary.highPriority, icon: AlertTriangle, color: '#f56565', bg: '#fff5f5' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
            style={{
              background: 'white',
              padding: 24,
              borderRadius: 20,
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              cursor: 'pointer'
            }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(103, 72, 70, 0.1)' }}
          >
            <div style={{
              background: stat.bg,
              padding: 16,
              borderRadius: 16,
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <stat.icon size={28} />
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#2d3748', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: '#718096', fontWeight: 500, marginTop: 4 }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 40 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          style={{ background: 'white', padding: 24, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
        >
          <h3 style={{ fontSize: 18, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={20} color="#674846" /> Task Status Distribution
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{ background: 'white', padding: 24, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
        >
          <h3 style={{ fontSize: 18, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="#674846" /> Priority Breakdown
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ background: 'white', padding: 32, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
      >
        <h3 style={{ fontSize: 20, marginBottom: 24, color: '#2d3748' }}>🔔 Upcoming Deadlines</h3>
        {summary.upcoming && summary.upcoming.length > 0 ? (
          <ul style={{ display: 'grid', gap: 16 }}>
            {summary.upcoming.map((t, i) => (
              <motion.li
                key={t._id}
                whileHover={{ x: 10, background: '#fafafa' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderRadius: 16,
                  border: '1px solid #f0f0f0',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#ebf8ff', color: '#4299e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <strong style={{ fontSize: 16, display: 'block', color: '#2d3748' }}>{t.title}</strong>
                    <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>
                      Due {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}
                    </div>
                  </div>
                </div>
                <span className={`priority-${(t.priority || 'MEDIUM').toLowerCase()}`} style={{
                  padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 0.5
                }}>
                  {t.priority}
                </span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>High five! 🙌 No upcoming deadlines in the next 7 days.</p>
          </div>
        )}
      </motion.div>

      {/* Recent Journals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ background: 'white', padding: 32, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginTop: 24 }}
      >
        <h3 style={{ fontSize: 20, marginBottom: 16, color: '#2d3748' }}>📝 Recent Journals</h3>
        {summary.recentJournals && summary.recentJournals.length > 0 ? (
          <ul style={{ display: 'grid', gap: 12 }}>
            {summary.recentJournals.map((j) => (
              <li key={j._id} style={{ padding: 12, borderRadius: 12, border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 14, color: '#2d3748', marginBottom: 6 }}>{j.summary || j.text.substring(0, 120) + (j.text.length > 120 ? '...' : '')}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>{j.mood ? `Mood: ${j.mood}` : ''} {j.priorities && j.priorities.length ? ` • Priorities: ${j.priorities.join(', ')}` : ''}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No recent journals found. Use the Tasks → AI journal feature to generate notes.</p>
          </div>
        )}
      </motion.div>

      {/* Chat Widget */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            style={{
              position: 'fixed',
              bottom: 100,
              right: 32,
              width: 350,
              height: 480,
              background: 'white',
              borderRadius: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <div style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #674846, #8a5c5a)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600 }}>Assistant</h4>
                <div style={{ fontSize: 12, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, background: '#48bb78', borderRadius: '50%' }}></div>
                  Online
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: '50%', color: 'white', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, padding: 20, overflowY: 'auto', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 16,
                    borderBottomLeftRadius: msg.sender === 'bot' ? 4 : 16,
                    borderBottomRightRadius: msg.sender === 'user' ? 4 : 16,
                    background: msg.sender === 'user' ? '#674846' : 'white',
                    color: msg.sender === 'user' ? 'white' : '#2d3748',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    fontSize: 14,
                    lineHeight: 1.5
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: 16, background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
              <input
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 24,
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: 14
                }}
              />
              <button
                type="submit"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#674846',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #674846, #8a5c5a)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(103, 72, 70, 0.4)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}
      >
        {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>
    </div>
  )
}
