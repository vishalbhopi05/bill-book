import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style jsx global>{`
        @media (max-width: 768px) {
          .login-title {
            font-size: 22px !important;
          }
          .login-subtitle {
            font-size: 14px !important;
          }
          .login-box {
            padding: 30px 20px !important;
            margin: 20px !important;
          }
        }
      `}</style>
      
      <div className="login-box" style={styles.loginBox}>
        <h1 className="login-title" style={styles.title}>Prashant Event & Fireworks</h1>
        <h2 className="login-subtitle" style={styles.subtitle}>Bill Management System</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your username"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '0',
    borderRadius: '15px',
    boxShadow: '0 8px 24px rgba(211, 47, 47, 0.3)',
    width: '100%',
    maxWidth: '450px',
    overflow: 'hidden',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '8px',
    letterSpacing: '1px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    textTransform: 'uppercase',
    background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 50%, #b71c1c 100%)',
    padding: '30px 40px 15px 40px',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '0',
    fontWeight: '500',
    letterSpacing: '0.5px',
    background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 50%, #b71c1c 100%)',
    padding: '0 40px 30px 40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '40px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 50%, #b71c1c 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
    letterSpacing: '0.5px',
  },
  error: {
    padding: '10px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '5px',
    fontSize: '14px',
    textAlign: 'center',
  },
};
