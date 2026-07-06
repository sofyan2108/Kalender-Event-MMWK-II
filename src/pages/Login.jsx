import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to dashboard after login
    } catch (err) {
      setError('Gagal masuk. Periksa kembali email dan password Anda.');
      console.error(err);
    }
    
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInAnonymously(auth);
      navigate('/');
    } catch (err) {
      setError('Gagal masuk sebagai tamu. Pastikan Anonymous Sign-In diaktifkan di Firebase.');
      console.error(err);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Kalender Event</h2>
        <p className="subtitle">Masuk untuk mengelola jadwal Anda</p>
        
        {error && <div className="error-alert">{error}</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="admin@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="divider" style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.85rem', fontWeight: 600 }}>ATAU</span>
          <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
        </div>

        <button 
          type="button" 
          onClick={handleGuestLogin} 
          disabled={loading} 
          className="btn-cancel" 
          style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}
        >
          {loading ? 'Memproses...' : 'Masuk Sebagai Tamu'}
        </button>
      </div>
    </div>
  );
};

export default Login;
