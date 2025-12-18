import React, { useState } from 'react';
import API from '../utils/api';
import "./ElectricianLogin.css";

const ElectricianLogin = ({ onBackClick, onLoginSuccess }) => {
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

      // Role guard: only electrician allowed
      if (res.data?.user?.role !== 'electrician') {
        setError('Only electrician can login here');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      onLoginSuccess();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
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

      let msg = 'If the email exists, a reset link has been sent.';
      if (res?.data?.devToken) {
        // ONLY for development/testing when Gmail not configured
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
    <div className="electrician-login-container">
      <div className="electrician-login-card">
        <div className="electrician-login-logo">
          <img src="/src/assets/electrician-logo.png" alt="Logo" />
        </div>
        <div className="electrician-login-text">
          <h1>Electrician Login</h1>
          
        </div>

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword}>
            <div className="electrician-login-form-group">
              <input
                type="email"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="Your account email"
                required
              />
            </div>

            {error && <p className="electrician-login-error">{error}</p>}
            {fpMsg && <p className="electrician-login-info">{fpMsg}</p>}
            {fpDevToken && (
              <p className="electrician-login-info">
                Dev token: {fpDevToken}
              </p>
            )}

            <div className="electrician-login-buttons">
              <button
                type="submit"
                className="electrician-login-button"
                disabled={fpSubmitting}
              >
                {fpSubmitting ? 'Sending...' : 'Send reset link'}
              </button>
            </div>

            <p
              className="electrician-login-forgot-password"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </p>

            <p
              className="electrician-login-forgot-password"
              onClick={() => window.location.assign('/reset')}
              title="Go to reset page to enter the token and set a new password"
            >
              I have a token
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="electrician-login-form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="electrician-login-form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            {error && <p className="electrician-login-error">{error}</p>}
            <div className="electrician-login-buttons">
              <button
                type="submit"
                className="electrician-login-button"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
            <p
              className="electrician-login-forgot-password"
              onClick={() => {
                setShowForgotPassword(true);
                setFpEmail(email); // prefill from login email
                setError('');
                setFpMsg('');
                setFpDevToken('');
              }}
            >
              Forgot Password?
            </p>
          </form>
        )}

        <button onClick={onBackClick} className="electrician-login-back-button">
          Back
        </button>
      </div>
    </div>
  );
};

export default ElectricianLogin;
