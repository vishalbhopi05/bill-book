import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { shareViaWhatsApp, shareViaNativeShare, downloadBillImage } from '../utils/shareUtils';

export default function Bills() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchBills();
    }
  }, [user]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareMenu && !event.target.closest('.share-dropdown-menu') && !event.target.closest('button')) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const fetchBills = async (search = '') => {
    setLoading(true);
    try {
      const url = search
        ? `/api/bills/list?userId=${user.id}&search=${encodeURIComponent(search)}`
        : `/api/bills/list?userId=${user.id}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setBills(data.bills);
      } else {
        console.error('Failed to fetch bills:', data.message);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBills(searchQuery);
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
  };

  const handleCloseModal = () => {
    setSelectedBill(null);
  };

  const handleDeleteBill = async (billId) => {
    if (!confirm('Are you sure you want to delete this bill?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bill deleted successfully');
        fetchBills(searchQuery);
        if (selectedBill && selectedBill._id === billId) {
          setSelectedBill(null);
        }
      } else {
        toast.error('Failed to delete bill: ' + data.message);
      }
    } catch (error) {
      toast.error('Error deleting bill: ' + error.message);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handlePrintBill = () => {
    window.print();
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleShareWhatsApp = async () => {
    setShowShareMenu(false);
    if (selectedBill) {
      toast.loading('Generating bill image...', { id: 'share-loading' });
      const result = await shareViaWhatsApp('bill-view-container', selectedBill.billNumber);
      toast.dismiss('share-loading');
      
      if (result.success) {
        toast.success(result.message || 'Image downloaded! Opening WhatsApp...');
      } else {
        toast.error('Failed to generate bill image');
      }
    }
  };

  const handleShareNative = async () => {
    setShowShareMenu(false);
    if (selectedBill) {
      toast.loading('Generating bill image...', { id: 'share-loading' });
      const result = await shareViaNativeShare('bill-view-container', selectedBill.billNumber);
      toast.dismiss('share-loading');
      
      if (result.success) {
        toast.success(result.message || 'Shared successfully!');
      } else if (result.message !== 'Share cancelled') {
        toast.error(result.message || 'Failed to share');
      }
    }
  };

  const handleDownloadBill = async () => {
    setShowShareMenu(false);
    if (selectedBill) {
      toast.loading('Generating bill image...', { id: 'download-loading' });
      const result = await downloadBillImage('bill-view-container', selectedBill.billNumber);
      toast.dismiss('download-loading');
      
      if (result.success) {
        toast.success('Bill image downloaded!');
      } else {
        toast.error('Failed to download bill');
      }
    }
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .bill-view {
            box-shadow: none;
            border: 2px solid #000;
          }
        }
        
        @media (max-width: 768px) {
          .bills-header {
            padding: 12px 20px !important;
          }
          .bills-page-title {
            font-size: 16px !important;
          }
          .bills-back-btn {
            padding: 6px 12px !important;
            font-size: 13px !important;
          }
          
          /* Bill View Modal Container (Outer) */
          .bill-view {
            padding: 10px !important;
          }
          
          /* Bill View Content (Inner) */
          #bill-view-container {
            padding: 10px !important;
            border-width: 2px !important;
            margin: 0 !important;
          }
          
          /* Bill View Header Responsive Styles */
          #bill-view-container > div:first-child {
            padding: 12px 10px !important;
            margin-bottom: 12px !important;
          }
          #bill-view-container h1 {
            font-size: 16px !important;
            letter-spacing: 0.3px !important;
            margin: 0 0 4px 0 !important;
            line-height: 1.3 !important;
          }
          #bill-view-container > div:first-child p {
            font-size: 11px !important;
            margin: 3px 0 !important;
          }
          #bill-view-container > div:first-child p:last-of-type {
            padding: 4px 12px !important;
            margin-top: 4px !important;
          }
          
          /* Bill Info Section */
          #bill-view-container > div:nth-child(2) {
            padding: 10px !important;
            margin-bottom: 12px !important;
            font-size: 12px !important;
            gap: 10px !important;
          }
          #bill-view-container > div:nth-child(2) > div {
            min-width: 100% !important;
          }
          #bill-view-container > div:nth-child(2) p {
            font-size: 12px !important;
            margin: 4px 0 !important;
          }
          #bill-view-container > div:nth-child(2) strong {
            font-size: 12px !important;
          }
          
          /* Bill Table Wrapper */
          .bill-table-wrapper {
            margin-bottom: 12px !important;
            border: 1px solid #d32f2f !important;
            border-radius: 4px !important;
          }
          
          /* Bill Table */
          #bill-view-container table {
            font-size: 10px !important;
            margin-bottom: 0 !important;
            border-width: 0 !important;
            min-width: 500px !important;
          }
          #bill-view-container table th,
          #bill-view-container table td {
            padding: 6px 4px !important;
            font-size: 10px !important;
            border-width: 1px !important;
            white-space: nowrap !important;
          }
          #bill-view-container table th:first-child,
          #bill-view-container table td:first-child {
            padding-left: 6px !important;
          }
          #bill-view-container table th:last-child,
          #bill-view-container table td:last-child {
            padding-right: 6px !important;
          }
          
          /* Summary Section */
          #bill-view-container > div:last-child {
            padding: 10px !important;
            margin-bottom: 12px !important;
          }
          #bill-view-container > div:last-child > div {
            padding: 6px 0 !important;
            font-size: 12px !important;
          }
          #bill-view-container > div:last-child strong {
            font-size: 12px !important;
          }
          
          /* Modal Container */
          .bill-view {
            padding: 10px !important;
          }
          
          /* Modal Header */
          .bill-view > .no-print {
            flex-direction: column !important;
            align-items: flex-start !important;
            margin-bottom: 12px !important;
            padding-bottom: 10px !important;
            gap: 10px !important;
            border-bottom-width: 2px !important;
          }
          
          .bill-view > .no-print h2 {
            font-size: 16px !important;
            margin: 0 !important;
          }
          
          /* Modal Action Buttons Container */
          .bill-view > .no-print > div {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
            width: 100% !important;
          }
          
          /* Modal Action Buttons */
          .bill-view > .no-print button {
            padding: 8px 12px !important;
            font-size: 11px !important;
            border-radius: 6px !important;
            white-space: nowrap !important;
            flex: 1 1 auto !important;
            min-width: fit-content !important;
          }
          
          /* Share Menu Mobile Styles */
          .share-dropdown-menu {
            position: fixed !important;
            bottom: 20px !important;
            left: 10px !important;
            right: 10px !important;
            top: auto !important;
            transform: none !important;
            width: auto !important;
            max-width: none !important;
          }
          
          .share-dropdown-menu button {
            font-size: 13px !important;
            padding: 14px 16px !important;
          }
        }
      `}</style>

      <div className="no-print bills-header" style={styles.header}>
        <button onClick={handleBack} className="bills-back-btn" style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <h2 className="bills-page-title" style={styles.pageTitle}>All Bills</h2>
      </div>

      <div className="no-print" style={styles.content}>
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or bill number..."
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>
            🔍 Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              fetchBills('');
            }}
            style={styles.clearSearchBtn}
          >
            Clear
          </button>
        </form>

        {/* Bills List */}
        {loading ? (
          <div style={styles.loadingText}>Loading bills...</div>
        ) : bills.length === 0 ? (
          <div style={styles.noBills}>
            <p>No bills found</p>
            <button onClick={() => router.push('/generate-bill')} style={styles.createBillBtn}>
              Create New Bill
            </button>
          </div>
        ) : (
          <div style={styles.billsList}>
            {bills.map((bill) => (
              <div key={bill._id} style={styles.billCard}>
                <div style={styles.billCardHeader}>
                  <h3 style={styles.billCardTitle}>Bill #{bill.billNumber}</h3>
                  <span style={styles.billDate}>
                    {new Date(bill.billDate).toLocaleDateString()}
                  </span>
                </div>
                 <div style={styles.billCardBody}>
                   <p><strong>Customer:</strong> {bill.customerName}</p>
                   <p><strong>Total:</strong> ₹{Number(bill.subtotal || 0).toFixed(2)}</p>
                   <p><strong>Advance:</strong> ₹{Number(bill.advancePayment || 0).toFixed(2)}</p>
                   <p><strong>Balance:</strong> ₹{Number(bill.remainingAmount || 0).toFixed(2)}</p>
                 </div>
                 <div style={styles.billCardActions}>
                   <button
                     onClick={() => handleViewBill(bill)}
                     style={styles.viewBtn}
                   >
                     View
                   </button>
                   <button
                     onClick={() => router.push(`/edit-bill/${bill._id}`)}
                     style={styles.editBtn}
                   >
                     Edit
                   </button>
                   <button
                     onClick={() => handleDeleteBill(bill._id)}
                     style={styles.deleteBtn}
                   >
                     Delete
                   </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="bill-view" style={styles.modal}>
           <div className="no-print" style={styles.modalHeader}>
             <h2>Bill Details</h2>
             <div style={styles.modalActions}>
               <div style={{position: 'relative'}}>
                 <button onClick={handleShare} style={styles.shareModalBtn}>
                   📤 Share
                 </button>
                 {showShareMenu && (
                   <>
                     {window.innerWidth <= 768 && (
                       <div 
                         onClick={() => setShowShareMenu(false)}
                         className="share-backdrop"
                         style={{
                           position: 'fixed',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           backgroundColor: 'rgba(0,0,0,0.5)',
                           zIndex: 9999,
                         }}
                       />
                     )}
                     <div className="share-dropdown-menu" style={{
                       ...styles.shareMenu,
                       position: window.innerWidth <= 768 ? 'fixed' : 'absolute',
                       top: window.innerWidth <= 768 ? 'auto' : '100%',
                       bottom: window.innerWidth <= 768 ? '20px' : 'auto',
                       left: window.innerWidth <= 768 ? '10px' : 'auto',
                       right: window.innerWidth <= 768 ? '10px' : '0',
                       transform: 'none',
                       maxWidth: window.innerWidth <= 768 ? 'calc(100vw - 20px)' : 'auto',
                       width: window.innerWidth <= 768 ? 'calc(100vw - 20px)' : 'auto',
                     }}>
                       <button onClick={handleShareWhatsApp} style={styles.shareMenuItem}>
                         <span style={{marginRight: '8px'}}>💬</span> WhatsApp
                       </button>
                       <button onClick={handleDownloadBill} style={styles.shareMenuItem}>
                         <span style={{marginRight: '8px'}}>💾</span> Download
                       </button>
                       <button onClick={handleShareNative} style={styles.shareMenuItem}>
                         <span style={{marginRight: '8px'}}>📱</span> Share
                       </button>
                     </div>
                   </>
                 )}
               </div>
               <button onClick={handlePrintBill} style={styles.printModalBtn}>
                 🖨️ Print
               </button>
               <button onClick={handleCloseModal} style={styles.closeBtn}>
                 ✕
               </button>
             </div>
           </div>

          <div id="bill-view-container" style={styles.billView}>
            {/* Header */}
            <div style={styles.billViewHeader}>
              <h1 style={styles.billViewShopName}>Prashant Event & Fireworks</h1>
              <p style={styles.billViewAddress}>Badlapur</p>
              <p style={styles.billViewMobile}>Mobile: 9766817766 / 9767611761</p>
            </div>

            {/* Bill Info */}
            <div style={styles.billViewInfo}>
              <div>
                <p><strong>Customer:</strong> {selectedBill.customerName}</p>
                {selectedBill.customerAddress && (
                  <p><strong>Address:</strong> {selectedBill.customerAddress}</p>
                )}
              </div>
              <div>
                <p><strong>Bill No:</strong> {selectedBill.billNumber}</p>
                <p><strong>Date:</strong> {new Date(selectedBill.billDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="bill-table-wrapper" style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
            <table style={styles.billViewTable}>
              <thead>
                <tr>
                  <th style={styles.billViewTh}>Sr No.</th>
                  <th style={styles.billViewTh}>Item Name</th>
                  <th style={styles.billViewTh}>Quantity</th>
                  <th style={styles.billViewTh}>Rate</th>
                  <th style={styles.billViewTh}>Amount</th>
                </tr>
              </thead>
               <tbody>
                 {selectedBill.items.map((item, index) => (
                   <tr key={index}>
                     <td style={styles.billViewTd}>{index + 1}</td>
                     <td style={styles.billViewTd}>
                       {item.itemName === 'Other' ? item.customItem : item.itemName}
                     </td>
                     <td style={styles.billViewTd}>{Number(item.quantity || 0)}</td>
                     <td style={styles.billViewTd}>₹{Number(item.rate || 0).toFixed(2)}</td>
                     <td style={styles.billViewTd}>₹{Number(item.amount || 0).toFixed(2)}</td>
                   </tr>
                 ))}
              </tbody>
            </table>
            </div>

             {/* Summary */}
             <div style={styles.billViewSummary}>
               <div style={styles.summaryRow}>
                 <strong>Total Amount:</strong>
                 <span>₹{Number(selectedBill.subtotal || 0).toFixed(2)}</span>
               </div>
               <div style={styles.summaryRow}>
                 <strong>Advance Payment:</strong>
                 <span>₹{Number(selectedBill.advancePayment || 0).toFixed(2)}</span>
               </div>
               {selectedBill.additionalPayment > 0 && (
                 <div style={styles.summaryRow}>
                   <strong>Additional Payment:</strong>
                   <span>₹{Number(selectedBill.additionalPayment || 0).toFixed(2)}</span>
                 </div>
               )}
               {selectedBill.totalPaid > 0 && (
                 <div style={styles.summaryRow}>
                   <strong>Total Paid:</strong>
                   <span>₹{Number(selectedBill.totalPaid || 0).toFixed(2)}</span>
                 </div>
               )}
               <div style={styles.summaryRow}>
                 <strong>Balance Due:</strong>
                 <span style={{color: Number(selectedBill.remainingAmount || 0) > 0 ? '#d32f2f' : '#4CAF50'}}>
                   ₹{Number(selectedBill.remainingAmount || 0).toFixed(2)}
                 </span>
               </div>
             </div>

            {/* Footer */}
            <div style={styles.billViewFooter}>
              <p>Prashant Event & Fireworks</p>
            </div>
          </div>
        </div>
      )}
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
    alignItems: 'center',
    gap: '20px',
    borderBottom: '1px solid #f0f0f0',
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    color: '#1a1a1a',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  pageTitle: {
    fontSize: '20px',
    color: '#1a1a1a',
    margin: 0,
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  content: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  searchForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '250px',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  },
  searchBtn: {
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  clearSearchBtn: {
    padding: '12px 24px',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#666',
    padding: '40px',
  },
  noBills: {
    textAlign: 'center',
    padding: '40px',
  },
  createBillBtn: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  billsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  billCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '2px solid #d32f2f',
  },
  billCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '2px solid #f0f0f0',
  },
  billCardTitle: {
    fontSize: '18px',
    color: '#d32f2f',
    margin: 0,
  },
  billDate: {
    fontSize: '12px',
    color: '#666',
  },
  billCardBody: {
    marginBottom: '15px',
  },
  billCardActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  viewBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  editBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteBtn: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    overflow: 'auto',
    padding: '20px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '3px solid #d32f2f',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    position: 'relative',
  },
  shareModalBtn: {
    padding: '10px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: '2px solid #4CAF50',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  },
  printModalBtn: {
    padding: '10px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: '2px solid #2196F3',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  },
  closeBtn: {
    padding: '10px 24px',
    backgroundColor: '#f44336',
    color: 'white',
    border: '2px solid #f44336',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  },
  shareMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: 'white',
    border: '2px solid #4CAF50',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 10000,
    minWidth: '180px',
    overflow: 'hidden',
  },
  shareMenuItem: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'white',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s',
    borderBottom: '1px solid #f0f0f0',
  },
  billView: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '30px',
    border: '3px solid #d32f2f',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  billViewHeader: {
    background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 50%, #b71c1c 100%)',
    padding: '25px 20px',
    marginBottom: '20px',
    textAlign: 'center',
    borderRadius: '8px 8px 0 0',
    boxShadow: '0 4px 6px rgba(211, 47, 47, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  billViewShopName: {
    fontSize: '32px',
    color: '#ffffff',
    margin: '0 0 8px 0',
    fontWeight: '700',
    letterSpacing: '1px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    textTransform: 'uppercase',
  },
  billViewAddress: {
    margin: '5px 0',
    color: '#ffebee',
    fontSize: '15px',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
  billViewMobile: {
    fontWeight: '600',
    margin: '10px 0 0 0',
    color: '#ffffff',
    fontSize: '16px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'inline-block',
    padding: '6px 20px',
    borderRadius: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  billViewInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    padding: '15px',
    border: '2px solid #d32f2f',
    flexWrap: 'wrap',
    gap: '20px',
  },
  billViewTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    border: '2px solid #d32f2f',
  },
  billViewTh: {
    backgroundColor: '#fff',
    border: '2px solid #d32f2f',
    padding: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  billViewTd: {
    border: '2px solid #d32f2f',
    padding: '10px',
    textAlign: 'center',
  },
  billViewSummary: {
    border: '2px solid #d32f2f',
    padding: '15px',
    marginBottom: '20px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  billViewFooter: {
    textAlign: 'right',
    paddingTop: '40px',
    marginTop: '20px',
    borderTop: '2px solid #d32f2f',
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
