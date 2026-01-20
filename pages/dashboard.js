import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleGenerateBill = () => {
    router.push('/generate-bill');
  };

  const handleViewBills = () => {
    router.push('/bills');
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Prashant Event & Fireworks</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>Welcome, {user.name}!</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.dashboardTitle}>Dashboard</h2>
        <p style={styles.subtitle}>What would you like to do today?</p>

        <div style={styles.cardContainer}>
          <div style={styles.card} onClick={handleGenerateBill}>
            <div style={styles.icon}>📝</div>
            <h3 style={styles.cardTitle}>Generate Bill</h3>
            <p style={styles.cardDescription}>
              Create a new bill for your customers
            </p>
          </div>

          <div style={styles.card} onClick={handleViewBills}>
            <div style={styles.icon}>📋</div>
            <h3 style={styles.cardTitle}>View Bills</h3>
            <p style={styles.cardDescription}>
              View and manage all your bills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: '20px 40px',
    borderBottom: '3px solid #d32f2f',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#d32f2f',
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  logoutBtn: {
    padding: '8px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  content: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  dashboardTitle: {
    fontSize: '32px',
    color: '#333',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '40px',
    textAlign: 'center',
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid #d32f2f',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
    textAlign: 'center',
  },
  icon: {
    fontSize: '60px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '24px',
    color: '#d32f2f',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: '16px',
    color: '#666',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '20px',
    color: '#666',
  },
};
