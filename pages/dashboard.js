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
      <style jsx global>{`
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 12px 20px !important;
          }
          .dashboard-title {
            font-size: 16px !important;
          }
          .user-name {
            font-size: 13px !important;
          }
          .logout-btn {
            padding: 8px 16px !important;
            font-size: 13px !important;
          }
          .dashboard-content-title {
            font-size: 22px !important;
          }
          
          /* Card Styles Mobile */
          .card-container {
            gap: 15px !important;
          }
        }
      `}</style>
      
      <div className="dashboard-header" style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>🎆</div>
          <h1 className="dashboard-title" style={styles.title}>Prashant Event & Fireworks</h1>
        </div>
        <div style={styles.userInfo}>
          <span className="user-name" style={styles.userName}>{user.name}</span>
          <button onClick={handleLogout} className="logout-btn" style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 className="dashboard-content-title" style={styles.dashboardTitle}>Dashboard</h2>
        <p style={styles.subtitle}>What would you like to do today?</p>

        <div className="card-container" style={styles.cardContainer}>
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
    backgroundColor: '#ffffff',
    padding: '16px 40px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    borderBottom: '1px solid #f0f0f0',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '28px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6e6d7a',
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  content: {
    padding: '30px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  dashboardTitle: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'center',
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    border: '2px solid #d32f2f',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
    textAlign: 'center',
  },
  icon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '18px',
    color: '#d32f2f',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.4',
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
