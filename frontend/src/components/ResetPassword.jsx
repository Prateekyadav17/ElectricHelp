import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import './StaffLogin.css';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token');
    if (t) setToken(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!token || !newPassword) {
      setMsg('Please enter token and new password');
      return;
    }
    try {
      setSubmitting(true);
      await API.post('/auth/reset', { token, newPassword });
      setMsg('Password reset successful. You can now login.');
      setTimeout(() => {
        window.location.assign('/'); // staff login route
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="staff-login-container">
      <div className="staff-login-card">
        <h1>Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="staff-login-form-group">
            <input
              type="text"
              placeholder="Reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <div className="staff-login-form-group">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          {msg && <p className="staff-login-info">{msg}</p>}
          <div className="staff-login-buttons">
            <button type="submit" className="staff-login-button" disabled={submitting}>
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
