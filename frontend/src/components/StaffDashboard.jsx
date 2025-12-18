import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import './StaffDashboard.css';

const StaffDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('menu'); // default to menu (3 cards)
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    category: 'electrical'
  });

  // Assignment controls
  const [electricians, setElectricians] = useState([]);
  const [assignMode, setAssignMode] = useState('any'); // 'any' or 'user'
  const [assignTo, setAssignTo] = useState('');

  // Images UI only for now
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (activeTab === 'myComplaints') {
      fetchComplaints();
    } else if (activeTab === 'submit') {
      loadElectricians();
    }
  }, [activeTab]);

  const loadElectricians = async () => {
    try {
      const res = await API.get('/users', { params: { role: 'electrician' } });
      setElectricians(Array.isArray(res.data) ? res.data : []);
    } catch {
      setElectricians([]);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/complaints/mine');
      setComplaints(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to fetch complaints');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setError('You can upload maximum 5 images');
      return;
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (files.some((file) => !validTypes.includes(file.type))) {
      setError('Please upload only image files (JPEG, PNG, GIF)');
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError('Each image must be less than 5MB');
      return;
    }
    setError('');
    setSelectedImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    if (imagePreviews[index]) URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        priority: formData.priority,
        category: formData.category,
        images: [],
        visibleToAll: assignMode === 'any',
        assignedTo: assignMode === 'user' ? assignTo : null
      };

      if (!payload.title?.trim()) {
        setError('Title is required');
        setLoading(false);
        return;
      }
      if (assignMode === 'user' && !assignTo) {
        setError('Please select an electrician');
        setLoading(false);
        return;
      }

      await API.post('/complaints', payload);

      setSuccess('Complaint submitted successfully!');
      setFormData({
        title: '',
        description: '',
        location: '',
        priority: 'medium',
        category: 'electrical'
      });
      setAssignMode('any');
      setAssignTo('');
      setSelectedImages([]);
      setImagePreviews([]);
      const fileInput = document.getElementById('image-upload');
      if (fileInput) fileInput.value = '';

      if (activeTab === 'myComplaints') {
        await fetchComplaints();
      }

      setLoading(false);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit complaint');
      setLoading(false);
    }
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

  return (
    <div className="staff-dashboard-container">
      {/* Header */}
      <div className="staff-dashboard-header">
        <div className="staff-dashboard-logo">
          <img src="/src/assets/staff-logo.png" alt="Staff Logo" />
          <h1>Staff Dashboard</h1>
        </div>
        <div className="staff-dashboard-user">
          <span style={{ marginRight: '28px', color: '#fff' }}>
            Welcome, {user?.name || 'User'}
          </span>
          <button onClick={onLogout} className="staff-logout-button">Logout</button>
        </div>
      </div>

      {/* Top tabs still available on larger screens */}
      <div className="staff-dashboard-tabs">
        <button className={activeTab === 'menu' ? 'tab-active' : 'tab-inactive'} onClick={() => setActiveTab('menu')}>
          Menu
        </button>
        <button className={activeTab === 'submit' ? 'tab-active' : 'tab-inactive'} onClick={() => setActiveTab('submit')}>
          Submit
        </button>
        <button className={activeTab === 'myComplaints' ? 'tab-active' : 'tab-inactive'} onClick={() => setActiveTab('myComplaints')}>
          My Complaints
        </button>
        <button className={activeTab === 'profile' ? 'tab-active' : 'tab-inactive'} onClick={() => setActiveTab('profile')}>
          Profile
        </button>
      </div>

      <div className="staff-dashboard-content">
        {/* 3-card landing menu */}
        {activeTab === 'menu' && (
          <div className="staff-menu-grid">
            <div className="staff-menu-card" onClick={() => setActiveTab('submit')}>
              <div className="staff-menu-icon"><i className="ri-draft-fill"></i></div>
              <h3>Submit Complaint</h3>
              <p>Report a new issue with details and priority.</p>
            </div>
            <div className="staff-menu-card" onClick={() => setActiveTab('myComplaints')}>
              <div className="staff-menu-icon"><i className="ri-task-fill"></i></div>
              <h3>My Complaints</h3>
              <p>Track the status and updates for your submissions.</p>
            </div>
            <div className="staff-menu-card" onClick={() => setActiveTab('profile')}>
              <div className="staff-menu-icon"><i className="ri-user-fill"></i></div>
              <h3>Profile</h3>
              <p>View your account details and usage summary.</p>
            </div>
          </div>
        )}

        {/* Submit form with narrower max width */}
        {activeTab === 'submit' && (
          <div className="staff-complaint-form form-narrow">
            <h2>Submit New Complaint</h2>
            {error && <div className="staff-error-message">{error}</div>}
            {success && <div className="staff-success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="staff-form-group">
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter complaint title" required />
              </div>

              <div className="staff-form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the issue in detail" rows="5" required />
              </div>

              <div className="staff-form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Enter location (e.g., Room 101, Building A)" required />
              </div>

              <div className="staff-form-row">
                <div className="staff-form-group">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="staff-form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Assignment controls */}
              <div className="staff-form-row">
                <div className="staff-form-group">
                  <label>Assign Mode</label>
                  <select value={assignMode} onChange={(e) => setAssignMode(e.target.value)}>
                    <option value="any">Anyone (visible to all electricians)</option>
                    <option value="user">Specific electrician</option>
                  </select>
                </div>

                {assignMode === 'user' && (
                  <div className="staff-form-group">
                    <label>Assign To</label>
                    <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} required>
                      <option value="">Select electrician</option>
                      {electricians.map(elec => (
                        <option key={elec._id} value={elec._id}>
                          {elec.name} ({elec.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Image upload UI (not sent yet) */}
              <div className="staff-form-group">
                <label>Upload Photos (Optional - Max 5 images)</label>
                <div className="image-upload-wrapper">
                  <input id="image-upload" type="file" accept="image/*" multiple onChange={handleImageChange} className="image-upload-input" />
                  <label htmlFor="image-upload" className="image-upload-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Choose Images</span>
                  </label>
                  <p className="image-upload-hint">Supported: JPEG, PNG, GIF (Max 5MB each)</p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="image-preview-container">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button type="button" className="image-remove-btn" onClick={() => removeImage(index)} title="Remove image">
                          ×
                        </button>
                        <span className="image-name">
                          {selectedImages[index]?.name?.length > 15
                            ? selectedImages[index].name.substring(0, 15) + '...'
                            : selectedImages[index]?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="staff-submit-button" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'myComplaints' && (
          <div className="staff-complaints-list">
            <h2>My Complaints</h2>
            {loading && <div className="staff-loading">Loading complaints...</div>}
            {!loading && complaints.length === 0 && (
              <div className="staff-no-complaints">
                <p>No complaints found. Submit your first complaint!</p>
              </div>
            )}
            {!loading && complaints.length > 0 && (
              <div className="staff-complaints-grid">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="staff-complaint-card">
                    <div className="staff-complaint-header">
                      <h3>{complaint.title}</h3>
                      <span className="staff-complaint-status" style={{ backgroundColor: getStatusColor(complaint.status) }}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="staff-complaint-description">{complaint.description}</p>
                    <div className="staff-complaint-details">
                      <div className="staff-complaint-detail"><strong>Location:</strong> {complaint.location}</div>
                      <div className="staff-complaint-detail"><strong>Priority:</strong> <span className={`priority-${complaint.priority}`}>{complaint.priority}</span></div>
                      <div className="staff-complaint-detail"><strong>Category:</strong> {complaint.category}</div>
                      <div className="staff-complaint-detail"><strong>Submitted:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</div>
                    </div>

                    {complaint.visibleToAll && (
                      <div className="staff-complaint-assigned"><strong>Visibility:</strong> Anyone (all electricians)</div>
                    )}
                    {complaint.assignedTo && (
                      <div className="staff-complaint-assigned"><strong>Assigned to:</strong> {complaint.assignedTo?.name || '—'}</div>
                    )}

                    {Array.isArray(complaint.comments) && complaint.comments.length > 0 && (
                      <div className="staff-complaint-comments">
                        <strong>Latest Update:</strong>
                        <p>{complaint.comments[complaint.comments.length - 1].text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="staff-profile">
            <h2>My Profile</h2>
            <div className="staff-profile-card">
              <div className="staff-profile-avatar">
                <img src="/src/assets/staff-logo.png" alt="Profile" />
              </div>
              <div className="staff-profile-info">
                <div className="staff-profile-field"><strong>Name:</strong><span>{user?.name || 'N/A'}</span></div>
                <div className="staff-profile-field"><strong>Email:</strong><span>{user?.email || 'N/A'}</span></div>
                <div className="staff-profile-field"><strong>Department:</strong><span>{user?.department || 'N/A'}</span></div>
                <div className="staff-profile-field"><strong>Phone:</strong><span>{user?.phone || 'N/A'}</span></div>
                <div className="staff-profile-field"><strong>Total Complaints:</strong><span>{complaints.length}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
