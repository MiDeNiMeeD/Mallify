import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiUser, FiSearch } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const DriverChat = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDrivers();
    fetchMessages();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await apiClient.getDrivers({ limit: 100 });
      setDrivers(response.data?.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMessages({ limit: 100 });
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDriver) return;

    try {
      await apiClient.sendMessage({
        conversationId: `manager-driver-${selectedDriver._id}`,
        senderId: 'manager-id', // Replace with actual manager ID
        receiverId: selectedDriver._id,
        content: newMessage,
        messageType: 'text'
      });
      setNewMessage('');
      alert('Message sent successfully');
      fetchMessages();
    } catch (error) {
      alert('Failed to send message');
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone?.includes(searchTerm)
  );

  const driverMessages = selectedDriver 
    ? messages.filter(m => 
        m.senderId?._id === selectedDriver._id || 
        m.receiverId?._id === selectedDriver._id
      )
    : [];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Chat</h1>
          <p className="page-subtitle">Communicate with drivers in real-time</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', height: 'calc(100vh - 250px)' }}>
        {/* Drivers List */}
        <div className="content-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Drivers</h3>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredDrivers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FiUser size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                <p>No drivers found</p>
              </div>
            ) : (
              filteredDrivers.map((driver) => (
                <div
                  key={driver._id}
                  onClick={() => setSelectedDriver(driver)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    backgroundColor: selectedDriver?._id === driver._id ? 'var(--light-bg)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--light-bg)'}
                  onMouseLeave={(e) => {
                    if (selectedDriver?._id !== driver._id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {driver.name?.[0] || 'D'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500' }}>{driver.name || 'Unnamed Driver'}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {driver.status || 'offline'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="content-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {!selectedDriver ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ textAlign: 'center' }}>
                <FiMessageSquare size={64} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
                <p>Select a driver to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {selectedDriver.name?.[0] || 'D'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>{selectedDriver.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {selectedDriver.phone} • {selectedDriver.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {driverMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  driverMessages.map((message) => {
                    const isFromManager = message.senderId?._id !== selectedDriver._id;
                    return (
                      <div
                        key={message._id}
                        style={{
                          alignSelf: isFromManager ? 'flex-end' : 'flex-start',
                          maxWidth: '70%'
                        }}
                      >
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            backgroundColor: isFromManager ? 'var(--primary-color)' : 'var(--light-bg)',
                            color: isFromManager ? 'white' : 'inherit'
                          }}
                        >
                          <div>{message.content}</div>
                          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                    <FiSend size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverChat;
