import React, { useState } from 'react';
import API from '../utils/api';
import "./StaffLogin.css";

const StaffLogin = ({ onBackClick, onLoginSuccess }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', { email, password });

      // Role guard: only staff allowed
      if (res.data?.user?.role !== 'staff') {
        setError('Only staff can login here');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      onLoginSuccess(); // navigate to dashboard
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  // Forgot password: call backend to issue token / email
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
      const res = await API.post('/auth/forgot', { email: fpEmail.trim().toLowerCase() });

      let msg = 'If the email exists, a reset link has been sent.';
      if (res?.data?.devToken) {
        setFpDevToken(res.data.devToken); // ONLY for development/testing
      }
      setFpMsg(msg);
    } catch {
      setFpMsg('If the email exists, a reset link has been sent.');
    } finally {
      setFpSubmitting(false);
    }
  };

  return (
    <div className="staff-login-container">
      <div className="staff-login-card">
        <div className="staff-login-logo">
          <img src="/src/assets/staff-logo.png" alt="Logo" />
        </div>
        <div className="staff-login-text">
          <h1>Staff Login</h1>
        </div>

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword}>
            <div className="staff-login-form-group">
              <input
                type="email"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="Your account email"
                required
              />
            </div>

            {error && <p className="staff-login-error">{error}</p>}
            {fpMsg && <p className="staff-login-info">{fpMsg}</p>}
            {fpDevToken && (
              <p className="staff-login-info">
                Dev token: {fpDevToken}
              </p>
            )}

            <div className="staff-login-buttons">
              <button type="submit" className="staff-login-button" disabled={fpSubmitting}>
                {fpSubmitting ? 'Sending...' : 'Send reset link'}
              </button>
            </div>

            <div className="staff-login-links-row">
              <button
                type="button"
                className="link-like"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login  
              </button>   
              <button
                type="button"
                className="link-like"
                onClick={() => window.location.assign('/reset')}
                title="Go to reset page to enter the token and set a new password"
              >
                I have a token
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="staff-login-form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="staff-login-form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            {error && <p className="staff-login-error">{error}</p>}
            <div className="staff-login-buttons">
              <button type="submit" className="staff-login-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
            <p
              className="staff-login-forgot-password"
              onClick={() => {
                setShowForgotPassword(true);
                setFpEmail(email); // prefill
                setError('');
                setFpMsg('');
                setFpDevToken('');
              }}
            >
              Forgot Password?
            </p>
          </form>
        )}

        <button onClick={onBackClick} className="staff-login-back-button">
          Back
        </button>
      </div>
    </div>
  );
};

export default StaffLogin;
