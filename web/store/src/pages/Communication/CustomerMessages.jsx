import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function CustomerMessages() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.boutiqueList?.[0]) {
        setError('No boutique found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getMessages({ boutiqueId: user.boutiqueList[0] });
        if (response.success) {
          setMessages(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user]);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.senderId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'unread' && !msg.read) ||
                         (filterStatus === 'read' && msg.read);
    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  const handleMarkRead = async (id) => {
    try {
      await apiClient.markMessageAsRead(id);
      setMessages(messages.map(m => m._id === id ? { ...m, read: true } : m));
    } catch (err) {
      alert('Failed to mark as read');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Messages</h1>
          <p className="page-subtitle">Communicate with customers and respond to inquiries</p>
        </div>
        <button className="btn-primary">
          <Send size={18} />
          Send Message
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Messages</span>
            <div className="stat-icon pink"><MessageSquare size={20} /></div>
          </div>
          <div className="stat-value">{messages.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Unread</span>
            <div className="stat-icon warning"><MessageSquare size={20} /></div>
          </div>
          <div className="stat-value">{unreadCount}</div>
          {unreadCount > 0 && <div className="stat-trend negative">⚠️ Needs response</div>}
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Read</span>
            <div className="stat-icon success"><MessageSquare size={20} /></div>
          </div>
          <div className="stat-value">{messages.filter(m => m.read).length}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Messages</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-secondary)' 
                }} 
              />
              <input
                type="text"
                className="search-bar"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <select 
              className="form-input" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}></th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <MessageSquare size={48} />
                      <p>No messages found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr key={message._id} style={{ 
                    backgroundColor: !message.read ? 'var(--light-bg)' : 'transparent',
                    fontWeight: !message.read ? '500' : 'normal'
                  }}>
                    <td>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: !message.read ? 'var(--primary-color)' : 'transparent',
                        margin: '0 auto'
                      }} />
                    </td>
                    <td><strong>{message.senderId?.name || 'Customer'}</strong></td>
                    <td>{message.subject || 'No subject'}</td>
                    <td style={{ 
                      maxWidth: '300px', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {message.content}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(message.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" title="View" onClick={() => handleMarkRead(message._id)}>
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" title="Reply">
                          <Send size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Quick Reply</h2>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Select Template</label>
            <select className="form-select">
              <option>Thank you for your inquiry</option>
              <option>Order status update</option>
              <option>Product information</option>
              <option>Refund processed</option>
              <option>Custom message</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder="Type your response here..."
            />
          </div>
          <button className="btn-primary">
            <Send size={18} />
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerMessages;
