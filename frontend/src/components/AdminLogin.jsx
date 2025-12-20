import React, { useState } from 'react';
import API from '../utils/api';
import "./AdminLogin.css";

// Vite-safe asset import (important for Vercel/production)
import adminLogo from '../assets/admin-logo.png';

const AdminLogin = ({ onBackClick, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot-password UI state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpMsg, setFpMsg] = useState('');
  const [fpSubmitting, setFpSubmitting] = useState(false);
  const [fpDevToken, setFpDevToken] = useState(''); // dev only

  // ---------- LOGIN ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', { email, password });

      // Role guard (ensure only admin proceeds)
      if (res.data?.user?.role !== 'admin') {
        setError('Only admin can login here');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      onLoginSuccess(); // navigate to admin dashboard
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  // ---------- FORGOT PASSWORD ----------
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setFpMsg('');
    setFpDevToken('');

    if (!fpEmail || !/^\S+@\S+\.\S+$/.test(fpEmail)) {
      setError('Please enter a valid email');
      return;
    }

    try {
      setFpSubmitting(true);
      const res = await API.post('/auth/forgot', {
        email: fpEmail.trim().toLowerCase()
      });

      const msg = 'If the email exists, a reset link has been sent.';
      if (res?.data?.devToken) {
        // ONLY for development/testing when Gmail is not fully configured
        setFpDevToken(res.data.devToken);
      }
      setFpMsg(msg);
    } catch {
      setFpMsg('If the email exists, a reset link has been sent.');
    } finally {
      setFpSubmitting(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <img src={adminLogo} alt="Admin Logo" />
        </div>

        <div className="admin-login-text">
          <h1>Admin Login</h1>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }} />
        </div>

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword}>
            <div className="admin-login-form-group">
              <input
                type="email"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="Your account email"
                required
              />
            </div>

            {error && <p className="admin-login-error">{error}</p>}
            {fpMsg && <p className="admin-login-info">{fpMsg}</p>}
            {fpDevToken && (
              <p className="admin-login-info">
                Dev token: {fpDevToken}
              </p>
            )}

            <div className="admin-login-buttons">
              <button
                type="submit"
                className="admin-login-button"
                disabled={fpSubmitting}
              >
                {fpSubmitting ? 'Sending...' : 'Send reset link'}
              </button>
            </div>

            <p
              className="admin-login-forgot-password"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </p>

            <p
              className="admin-login-forgot-password"
              onClick={() => window.location.assign('/reset')}
              title="Go to reset page to enter the token and set a new password"
            >
              I have a token
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="admin-login-form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>

            <div className="admin-login-form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>

            {error && <p className="admin-login-error">{error}</p>}

            <div className="admin-login-buttons">
              <button
                type="submit"
                className="admin-login-button"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <p
              className="admin-login-forgot-password"
              onClick={() => {
                setShowForgotPassword(true);
                setFpEmail(email); // prefill from current email
                setError('');
                setFpMsg('');
                setFpDevToken('');
              }}
            >
              Forgot Password?
            </p>
          </form>
        )}

        <button onClick={onBackClick} className="admin-login-back-button">
          Back
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
