import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const fileInputRef = React.useRef(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    try {
      setLoading(true)
      const res = await api.get('/documents')
      if (res.data && res.data.documents) {
        setDocuments(res.data.documents)
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data.success) {
        setDocuments([res.data.document, ...documents])
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function deleteDocument(id) {
    if (!confirm('Delete this document?')) return

    try {
      await api.delete(`/documents/${id}`)
      setDocuments(documents.filter(d => d._id !== id))
    } catch (err) {
      setError('Failed to delete document')
    }
  }

  const categorized = {}
  documents.forEach(doc => {
    const cat = doc.analysis?.category || 'Uncategorized'
    if (!categorized[cat]) categorized[cat] = []
    categorized[cat].push(doc)
  })

  const filtered = activeTab === 'all'
    ? documents
    : (categorized[activeTab] || [])

  return (
    <div>
      <div className="card">
        <h2>📄 Document Management</h2>

        {/* Upload Section */}
        <div
          className="upload-box"
          onClick={() => fileInputRef.current?.click()}
        >
          <p>📷 Drag & drop your documents here or click to browse</p>
          <p style={{ fontSize: 12, color: '#999' }}>JPG, PNG, PDF images supported</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {uploading && (
          <div style={{ padding: 16, background: '#f0f8ff', borderRadius: 8, marginBottom: 16 }}>
            <div className="spinner" style={{ display: 'inline-block', marginRight: 12 }}></div>
            <span>Uploading & analyzing with OCR + AI...</span>
          </div>
        )}

        {error && (
          <div style={{ padding: 12, background: '#fff5f5', color: '#c53030', borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Category Tabs */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <button
            className={activeTab === 'all' ? '' : 'secondary'}
            onClick={() => setActiveTab('all')}
            style={{ width: 'auto', minWidth: 100 }}
          >
            All ({documents.length})
          </button>
          {Object.keys(categorized).map(cat => (
            <button
              key={cat}
              className={activeTab === cat ? '' : 'secondary'}
              onClick={() => setActiveTab(cat)}
              style={{ width: 'auto', minWidth: 120 }}
            >
              {cat} ({categorized[cat].length})
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading documents...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>📭 No documents yet. Upload one to get started!</p>
          </div>
        ) : (
          <div className="documents-grid">
            {filtered.map(doc => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                onDelete={deleteDocument}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentCard({ doc, onDelete }) {
  const analysis = doc.analysis || {}
  const icons = {
    'Financial': '💳',
    'Government': '🏛️',
    'Health': '🏥',
    'Personal': '👤',
    'Vehicle': '🚗'
  }

  const icon = icons[analysis.category] || '📄'

  return (
    <div className="document-card">
      <div className="doc-header">
        <div className="doc-type">{icon}</div>
      </div>

      <div className="doc-title">{analysis.summary || 'Untitled Document'}</div>

      {analysis.category && (
        <div className="doc-category">{analysis.category}</div>
      )}

      <div className="doc-details">
        {analysis.documentType && (
          <div><strong>Type:</strong> {analysis.documentType}</div>
        )}
        {analysis.provider && (
          <div><strong>Provider:</strong> {analysis.provider}</div>
        )}
        {analysis.idNumber && (
          <div><strong>ID:</strong> {analysis.idNumber}</div>
        )}
        {analysis.amount && (
          <div><strong>Amount:</strong> ${analysis.amount.toLocaleString()}</div>
        )}
        {analysis.dueDate && (
          <div><strong>Due:</strong> {new Date(analysis.dueDate).toLocaleDateString()}</div>
        )}
        {analysis.issueDate && (
          <div><strong>Issued:</strong> {new Date(analysis.issueDate).toLocaleDateString()}</div>
        )}
        {analysis.expiryDate && (
          <div><strong>Expires:</strong> {new Date(analysis.expiryDate).toLocaleDateString()}</div>
        )}
      </div>

      <div style={{
        padding: '8px 12px',
        background: analysis.priority === 'HIGH' ? '#ffe0e0' : analysis.priority === 'MEDIUM' ? '#fff8e0' : '#e0f2f1',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 12,
        color: analysis.priority === 'HIGH' ? '#c53030' : analysis.priority === 'MEDIUM' ? '#c05621' : '#00695c'
      }}>
        Priority: {analysis.priority || 'MEDIUM'}
      </div>

      <div className="doc-actions">
        <button
          className="secondary"
          onClick={() => onDelete(doc._id)}
          style={{ padding: '8px 12px', fontSize: 13 }}
        >
          🗑️ Delete
        </button>
      </div>

      {doc.extractedText && (
        <details style={{ marginTop: 12, fontSize: 12, cursor: 'pointer' }}>
          <summary style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>
            📋 Extracted Text
          </summary>
          <div style={{
            background: '#f8f9fa',
            padding: 8,
            borderRadius: 6,
            fontSize: 11,
            lineHeight: 1.5,
            maxHeight: 150,
            overflow: 'auto',
            color: '#666'
          }}>
            {doc.extractedText.substring(0, 300)}...
          </div>
        </details>
      )}
    </div>
  )
}
