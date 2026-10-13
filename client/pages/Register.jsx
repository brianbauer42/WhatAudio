import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', verify: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>
          Reg<span>ister</span>
        </h1>
        {error && <p className="message">{error}</p>}
        <div className="field">
          <label htmlFor="reg-name">Display name</label>
          <input
            id="reg-name"
            autoComplete="username"
            required
            maxLength={32}
            value={form.name}
            onChange={update('name')}
          />
        </div>
        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={update('email')}
          />
        </div>
        <div className="field">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={update('password')}
          />
        </div>
        <div className="field">
          <label htmlFor="reg-verify">Password again</label>
          <input
            id="reg-verify"
            type="password"
            autoComplete="new-password"
            required
            value={form.verify}
            onChange={update('verify')}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn" disabled={busy}>
            Create account
          </button>
          <Link to="/login" className="fine">
            Already registered?
          </Link>
        </div>
      </form>
    </main>
  );
}
