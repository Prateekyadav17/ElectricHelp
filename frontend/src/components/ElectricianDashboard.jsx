import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './ElectricianDashboard.css';

// Vite-safe asset import (important for production/Vercel)
import electricianLogo from '../assets/electrician-logo.png';

const ElectricianDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('assigned'); // assigned | pending | progress | resolved | profile
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (activeTab !== 'profile' && user?.role === 'electrician') {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      // Correct endpoint that backend provides for electricians
      const res = await api.get('/complaints/for-electrician');
      const list = Array.isArray(res.data) ? res.data : [];
      setComplaints(list);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // If you have not implemented this route yet, add it in backend:
  // PATCH /api/complaints/:id/status (auth(['electrician']))
  // Body: { status, comment }
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !newStatus) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await api.patch(`/complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
        comment
      });

      setSuccess('Status updated successfully!');
      setComment('');
      setSelectedComplaint(null);
      await fetchTasks();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status || 'pending');
    setComment('');
  };

  const closeModal = () => {
    setSelectedComplaint(null);
    setNewStatus('');
    setComment('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in-progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const filterComplaints = (status) => {
    if (status === 'all') return complaints;
    return complaints.filter((c) => c.status === status);
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in-progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length
  };

  const currentFilter =
    activeTab === 'assigned' ? 'all' :
    activeTab === 'pending' ? 'pending' :
    activeTab === 'progress' ? 'in-progress' :
    'resolved';

  const filtered = filterComplaints(currentFilter);

  return (
    <div className="electrician-dashboard-container">
      <div className="electrician-dashboard-header">
        <div className="electrician-dashboard-logo">
          <img src={electricianLogo} alt="Electrician Logo" />
          <h1>Electrician Dashboard</h1>
        </div>
        <div className="electrician-dashboard-user">
          <span style={{ marginRight: '15px', color: 'white', fontWeight: 600 }}>
            Welcome, {user?.name || 'User'}
          </span>
          <button onClick={onLogout} className="electrician-logout-button">Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="electrician-stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="electrician-dashboard-tabs">
        <button className={activeTab === 'assigned' ? 'tab-active' : 'tab-inactive'} onClick={() => setActiveTab('assigned')}>
          All Tasks
        </button>
        <button className={activeTab === 'pending' ? 'tab-active' : 'tab-inactive'} onClick={() => setActiveTab('pending')}>
          Pending
        </button>
        <button className={activeTab === 'progress' ? 'tab-active' : 'tab-inactive'} onClick={() => setActiveTab('progress')}>
          In Progress
        </button>
        <button className={activeTab === 'resolved' ? 'tab-active' : 'tab-inactive'} onClick={() => setActiveTab('resolved')}>
          Resolved
        </button>
        <button className={activeTab === 'profile' ? 'tab-active' : 'tab-inactive'} onClick={() => setActiveTab('profile')}>
          Profile
        </button>
      </div>

      <div className="electrician-dashboard-content">
        {error && <div className="electrician-error-message">{error}</div>}
        {success && <div className="electrician-success-message">{success}</div>}

        {activeTab !== 'profile' && (
          <div className="electrician-complaints-list">
            <h2>
              {activeTab === 'assigned' && 'All Assigned Tasks'}
              {activeTab === 'pending' && 'Pending Tasks'}
              {activeTab === 'progress' && 'Tasks In Progress'}
              {activeTab === 'resolved' && 'Resolved Tasks'}
            </h2>

            {loading ? (
              <div className="electrician-loading">Loading tasks...</div>
            ) : filtered.length === 0 ? (
              <div className="electrician-no-complaints">
                <p>No tasks found in this category.</p>
              </div>
            ) : (
              <div className="electrician-complaints-grid">
                {filtered.map((complaint) => (
                  <div key={complaint._id} className="electrician-complaint-card">
                    <div className="electrician-complaint-header">
                      <h3>{complaint.title}</h3>
                      <span
                        className="electrician-complaint-status"
                        style={{ backgroundColor: getStatusColor(complaint.status) }}
                      >
                        {complaint.status}
                      </span>
                    </div>

                    <p className="electrician-complaint-description">{complaint.description}</p>

                    {Array.isArray(complaint.images) && complaint.images.length > 0 && (
                      <div className="complaint-images-section">
                        <strong className="images-label">📷 Attached Photos:</strong>
                        <div className="complaint-images-grid">
                          {complaint.images.map((image, index) => (
                            <div key={index} className="complaint-image-item">
                              <img
                                src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                alt={`Complaint ${index + 1}`}
                                onClick={() =>
                                  window.open(
                                    typeof image === 'string' ? image : URL.createObjectURL(image),
                                    '_blank'
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="electrician-complaint-details">
                      <div className="electrician-complaint-detail">
                        <strong>Location:</strong> {complaint.location}
                      </div>
                      <div className="electrician-complaint-detail">
                        <strong>Priority:</strong>{' '}
                        <span className={`priority-${complaint.priority}`}>{complaint.priority}</span>
                      </div>
                      <div className="electrician-complaint-detail">
                        <strong>Category:</strong> {complaint.category}
                      </div>
                      <div className="electrician-complaint-detail">
                        <strong>Reported By:</strong> {complaint?.createdBy?.name || '—'}
                      </div>
                      <div className="electrician-complaint-detail">
                        <strong>Created:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {complaint.status !== 'resolved' && (
                      <button className="electrician-update-button" onClick={() => openUpdateModal(complaint)}>
                        Update Status
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="electrician-profile">
            <h2>My Profile</h2>
            <div className="electrician-profile-card">
              <div className="electrician-profile-avatar">
                <img src={electricianLogo} alt="Profile" />
              </div>
              <div className="electrician-profile-info">
                <div className="electrician-profile-field">
                  <strong>Name:</strong>
                  <span>{user?.name || 'N/A'}</span>
                </div>
                <div className="electrician-profile-field">
                  <strong>Email:</strong>
                  <span>{user?.email || 'N/A'}</span>
                </div>
                <div className="electrician-profile-field">
                  <strong>Specialization:</strong>
                  <span>{user?.specialization || 'N/A'}</span>
                </div>
                <div className="electrician-profile-field">
                  <strong>Phone:</strong>
                  <span>{user?.phone || 'N/A'}</span>
                </div>
                <div className="electrician-profile-field">
                  <strong>Total Assigned:</strong>
                  <span>{stats.total}</span>
                </div>
                <div className="electrician-profile-field">
                  <strong>Resolved:</strong>
                  <span>{stats.resolved}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Task Status</h2>
            <div className="modal-complaint-info">
              <h3>{selectedComplaint.title}</h3>
              <p>{selectedComplaint.location}</p>
            </div>

            {Array.isArray(selectedComplaint.images) && selectedComplaint.images.length > 0 && (
              <div className="modal-images-section">
                <strong>Attached Photos:</strong>
                <div className="modal-images-grid">
                  {selectedComplaint.images.map((image, index) => (
                    <img
                      key={index}
                      src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                      alt={`Photo ${index + 1}`}
                      onClick={() =>
                        window.open(
                          typeof image === 'string' ? image : URL.createObjectURL(image),
                          '_blank'
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateStatus}>
              <div className="modal-form-group">
                <label>Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label>Add Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add notes or updates about this task..."
                  rows="4"
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="modal-submit-btn" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
                <button type="button" className="modal-cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricianDashboard;
