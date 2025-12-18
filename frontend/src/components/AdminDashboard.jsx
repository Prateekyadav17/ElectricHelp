import React, { useEffect, useState } from 'react';
import API, { authHeaders } from '../utils/api';
import './AdminDashboard.css';

const RegisterUserCard = ({ onSuccess }) => {
  const [form, setForm] = useState({
    role: 'electrician',
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    specialization: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErr(''); setOk('');
      const payload = {
        role: form.role,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      };
      if (form.phone) payload.phone = form.phone.trim();
      if (form.department) payload.department = form.department.trim();
      if (form.specialization) payload.specialization = form.specialization.trim();

      await API.post('/users', payload, authHeaders());
      setOk('User registered');
      setForm({ role: form.role, name: '', email: '', password: '', phone: '', department: '', specialization: '' });
      onSuccess && onSuccess();
      setTimeout(() => setOk(''), 1500);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to register user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-panel">
      <h3 className="register-title">Register User</h3>
      {err && <div className="admin-error" style={{ marginBottom: 10 }}>{err}</div>}
      {ok && <div className="admin-success" style={{ marginBottom: 10 }}>{ok}</div>}
      <form className="register-form" onSubmit={submit}>
        <div className="form-group">
          <label>Role</label>
          <select name="role" value={form.role} onChange={onChange}>
            <option value="electrician">Electrician</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={form.name} onChange={onChange} placeholder="Full name" required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={onChange} placeholder="email@example.com" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Temporary password" required />
        </div>
        <div className="form-group">
          <label>Phone (optional)</label>
          <input name="phone" value={form.phone} onChange={onChange} placeholder="+91-XXXXXXXXXX" />
        </div>
        <div className="form-group">
          <label>Department (staff)</label>
          <input name="department" value={form.department} onChange={onChange} placeholder="e.g., Maintenance" />
        </div>
        <div className="form-group">
          <label>Specialization (electrician)</label>
          <input name="specialization" value={form.specialization} onChange={onChange} placeholder="e.g., Wiring, HVAC" />
        </div>
        <div className="register-actions">
          <button type="submit" className="register-submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </button>
          <button type="button" className="register-reset" onClick={() =>
            setForm({ role: 'electrician', name: '', email: '', password: '', phone: '', department: '', specialization: '' })
          }>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [electricians, setElectricians] = useState([]);
  const [staff, setStaff] = useState([]);
  const [userRoleTab, setUserRoleTab] = useState('electrician');
  const [assignModal, setAssignModal] = useState({ open: false, complaint: null });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ error: '', success: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStats();
    fetchComplaints();
    fetchElectricians();
    fetchStaff();
  }, []);

  const computeStatsFromComplaints = (all) => {
    const total = all.length;
    const pending = all.filter(c => c.status === 'pending').length;
    const inProgress = all.filter(c => c.status === 'in-progress').length;
    const resolved = all.filter(c => c.status === 'resolved').length;
    return { total, pending, inProgress, resolved };
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/complaints', authHeaders());
      const computed = computeStatsFromComplaints(res.data);
      setStats(prev => ({ ...(prev || {}), ...computed }));
    } catch (e) {
      setMsg({ error: 'Failed to load stats', success: '' });
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await API.get('/complaints', authHeaders());
      setComplaints(res.data);
      setLoading(false);
    } catch (e) {
      setMsg({ error: 'Failed to load complaints', success: '' });
      setLoading(false);
    }
  };

  const fetchElectricians = async () => {
    try {
      const res = await API.get('/users?role=electrician', authHeaders());
      setElectricians(res.data || []);
      setStats(prev => ({ ...(prev || {}), electricians: (res.data || []).length }));
    } catch (e) {
      setMsg({ error: 'Failed to load electricians', success: '' });
      setElectricians([]);
      setStats(prev => ({ ...(prev || {}), electricians: 0 }));
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await API.get('/users?role=staff', authHeaders());
      setStaff(res.data || []);
      setStats(prev => ({ ...(prev || {}), staff: (res.data || []).length }));
    } catch (e) {
      setStaff([]);
      setStats(prev => ({ ...(prev || {}), staff: 0 }));
    }
  };

  const openAssign = (c) => setAssignModal({ open: true, complaint: c });
  const closeAssign = () => setAssignModal({ open: false, complaint: null });

  const assignTo = async (electricianId) => {
    try {
      if (!assignModal.complaint?._id) return;
      setLoading(true);
      setMsg({ error: '', success: '' });

      await API.patch(`/complaints/${assignModal.complaint._id}/assign`, { assignedTo: electricianId }, authHeaders());

      setMsg({ success: 'Assigned successfully!', error: '' });
      closeAssign();
      await Promise.all([fetchComplaints(), fetchStats()]);
      setLoading(false);
      setTimeout(() => setMsg({ success: '', error: '' }), 2000);
    } catch (e) {
      setMsg({ error: 'Assignment failed', success: '' });
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await API.delete(`/users/${id}`, authHeaders());
      setMsg({ success: 'User deleted', error: '' });
      await Promise.all([fetchElectricians(), fetchStaff()]);
      setTimeout(() => setMsg({ success: '', error: '' }), 1500);
    } catch (e) {
      setMsg({ error: e?.response?.data?.error || 'Delete failed', success: '' });
    }
  };

  const statusBadge = (s) => ({
    backgroundColor: s === 'pending' ? '#FFA500' : s === 'in-progress' ? '#2196F3' : '#4CAF50',
    color: 'white',
    padding: '4px 8px',
    borderRadius: 6,
    textTransform: 'capitalize',
    fontSize: 12
  });

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="logo-row">
          <img src="/src/assets/admin-logo.png" alt="Admin" />
          <h1>Admin Dashboard</h1>
        </div>
        <div className="user-row">
          <span style={{ color: 'white', fontWeight: 600 }}>
            Welcome, {user?.name || 'Admin'}
          </span>
          <button onClick={onLogout} className="admin-logout">Logout</button>
        </div>
      </header>

      <div className="admin-tabs">
        <button className={tab === 'overview' ? 'tab-active' : 'tab-inactive'} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={tab === 'complaints' ? 'tab-active' : 'tab-inactive'} onClick={() => setTab('complaints')}>
          Complaints
        </button>
        <button className={tab === 'assign' ? 'tab-active' : 'tab-inactive'} onClick={() => setTab('assign')}>
          Assign
        </button>
        <button className={tab === 'users' ? 'tab-active' : 'tab-inactive'} onClick={() => setTab('users')}>
          Users
        </button>
        <button className={tab === 'profile' ? 'tab-active' : 'tab-inactive'} onClick={() => setTab('profile')}>
          Profile
        </button>
      </div>

      {msg.error && <div className="admin-error">{msg.error}</div>}
      {msg.success && <div className="admin-success">{msg.success}</div>}

      <main className="admin-content">
        {tab === 'overview' && stats && (
          <div className="kpi-grid">
            <div className="kpi-card kpi-total"><h3>{stats.total ?? 0}</h3><p>Total Complaints</p></div>
            <div className="kpi-card kpi-pending"><h3>{stats.pending ?? 0}</h3><p>Pending</p></div>
            <div className="kpi-card kpi-progress"><h3>{stats.inProgress ?? 0}</h3><p>In Progress</p></div>
            <div className="kpi-card kpi-resolved"><h3>{stats.resolved ?? 0}</h3><p>Resolved</p></div>
            <div className="kpi-card kpi-users"><h3>{stats.electricians ?? 0}</h3><p>Electricians</p></div>
            <div className="kpi-card kpi-users"><h3>{stats.staff ?? 0}</h3><p>Staff</p></div>
          </div>
        )}

        {tab === 'complaints' && (
          <div className="table-wrapper">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Assigned To</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c._id}>
                      <td>{c.title}</td>
                      <td style={{ textTransform: 'capitalize' }}>{c.priority}</td>
                      <td><span style={statusBadge(c.status)}>{c.status}</span></td>
                      <td>{c.location}</td>
                      <td>{c.assignedTo ? c.assignedTo.name : '-'}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="admin-assign-btn" onClick={() => openAssign(c)}>
                          {c.assignedTo ? 'Reassign' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'assign' && (
          <div className="assign-panel">
            <h2>Assign Complaints</h2>
            <div className="assign-list">
              {complaints.map(c => (
                <div className="assign-card" key={c._id}>
                  <div className="assign-info">
                    <h3>{c.title}</h3>
                    <p>{c.location}</p>
                    <span style={statusBadge(c.status)}>{c.status}</span>
                  </div>
                  <div className="assign-actions">
                    <button onClick={() => openAssign(c)} className="admin-assign-btn">
                      {c.assignedTo ? `Assigned: ${c.assignedTo.name}` : 'Assign'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="users-and-register">
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <button className={userRoleTab === 'electrician' ? 'tab-active' : 'tab-inactive'} onClick={() => setUserRoleTab('electrician')}>
                  Electricians ({stats?.electricians ?? 0})
                </button>
                <button className={userRoleTab === 'staff' ? 'tab-active' : 'tab-inactive'} onClick={() => setUserRoleTab('staff')}>
                  Staff ({stats?.staff ?? 0})
                </button>
              </div>

              <div className="users-grid">
                {(userRoleTab === 'electrician' ? electricians : staff).map(u => (
                  <div className="user-card" key={u._id || u.id}>
                    <div className="user-avatar">{userRoleTab === 'electrician' ? '⚡' : '👤'}</div>
                    <div className="user-info" style={{ flex: 1 }}>
                      <h3>{u.name}</h3>
                      <p>{u.email}</p>
                      {u.phone && <p>{u.phone}</p>}
                      {userRoleTab === 'electrician' ? (
                        <p>Specialization: {u.specialization || '—'}</p>
                      ) : (
                        <p>Department: {u.department || '—'}</p>
                      )}
                      <div className="user-stats">
                        <span>Assigned: {u.assigned ?? 0}</span>
                        <span>Resolved: {u.resolved ?? 0}</span>
                      </div>
                    </div>
                    <button className="admin-assign-btn" onClick={() => deleteUser(u._id || u.id)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <RegisterUserCard onSuccess={async () => { await Promise.all([fetchElectricians(), fetchStaff()]); }} />
          </div>
        )}

        {tab === 'profile' && (
          <div className="admin-profile">
            <div className="profile-card">
              <img src="/src/assets/admin-logo.png" alt="Admin" />
              <div>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Department:</strong> {user?.department}</p>
                <p><strong>Phone:</strong> {user?.phone}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {assignModal.open && (
        <div className="modal-overlay" onClick={closeAssign}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Assign Complaint</h2>
            <p><strong>{assignModal.complaint.title}</strong></p>
            <div className="elect-list">
              {electricians.length === 0 && (<p style={{ marginBottom: 12 }}>No electricians found.</p>)}
              {electricians.map(e => (
                <button
                  key={e._id || e.id}
                  className="elect-item"
                  onClick={() => assignTo(e._id || e.id)}
                  disabled={loading}
                >
                  <span>⚡ {e.name}</span>
                  <small>{e.specialization}</small>
                </button>
              ))}
            </div>
            <button className="modal-cancel" onClick={closeAssign}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
