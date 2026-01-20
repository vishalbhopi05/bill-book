import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { shareViaWhatsApp, shareViaNativeShare, downloadBillImage } from '../utils/shareUtils';

const PREDEFINED_ITEMS = [
  'Mandap',
  'Table',
  'LED Light',
  'Carpet',
  'Stage',
  'Side Partition',
  'Gate',
  'Other'
];

export default function GenerateBill() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([{
    id: 0,
    itemName: '',
    customItem: '',
    quantity: 0,
    rate: 0,
    amount: 0
  }]);
  const [itemIdCounter, setItemIdCounter] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState('');
  const [advancePayment, setAdvancePayment] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    setBillDate(today);

    // Fetch next bill number
    fetchNextBillNumber(parsedUser.id);
  }, []);

  const fetchNextBillNumber = async (userId) => {
    try {
      const response = await fetch(`/api/bills/next-number?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setBillNumber(data.billNumber);
      } else {
        console.error('Failed to fetch bill number');
        setBillNumber('BILL-AUTO');
      }
    } catch (error) {
      console.error('Error fetching bill number:', error);
      setBillNumber('BILL-AUTO');
    }
  };

  const addItem = () => {
    setItemIdCounter(prevCounter => {
      const newItem = {
        id: prevCounter,
        itemName: '',
        customItem: '',
        quantity: 0,
        rate: 0,
        amount: 0
      };
      setItems(prevItems => [...prevItems, newItem]);
      return prevCounter + 1;
    });
  };

  const removeItem = (itemId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateItem = (itemId, field, value) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount if quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
          const rate = field === 'rate' ? parseFloat(value) || 0 : item.rate;
          updatedItem.amount = qty * rate;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateRemaining = () => {
    return calculateSubtotal() - (parseFloat(advancePayment) || 0);
  };

  const handleSaveBill = async () => {
    // Validation
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    if (items.length === 0 || items.every(item => item.quantity === 0 && item.rate === 0)) {
      toast.error('Please add at least one item');
      return;
    }

    setSaving(true);

    try {
      const billData = {
        customerName,
        customerAddress,
        // billNumber will be auto-generated on server
        billDate,
        items: items.filter(item => item.quantity > 0 || item.rate > 0),
        subtotal: calculateSubtotal(),
        advancePayment: parseFloat(advancePayment) || 0,
        remainingAmount: calculateRemaining(),
      };

      const response = await fetch('/api/bills/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          billData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save bill');
      }

      toast.success(`Bill saved successfully! Bill Number: ${data.billNumber}`);
      
      // Update to next bill number without clearing the form
      fetchNextBillNumber(user.id);
    } catch (err) {
      toast.error('Error saving bill: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    // Validation before printing
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    if (items.length === 0 || items.every(item => item.quantity === 0 && item.rate === 0)) {
      toast.error('Please add at least one item');
      return;
    }

    window.print();
  };

  const clearBill = () => {
    if (confirm('Do you want to clear all data?')) {
      setCustomerName('');
      setCustomerAddress('');
      const today = new Date().toISOString().split('T')[0];
      setBillDate(today);
      setAdvancePayment(0);
      
      // Reset items with a single empty row
      setItems([{
        id: 0,
        itemName: '',
        customItem: '',
        quantity: 0,
        rate: 0,
        amount: 0
      }]);
      setItemIdCounter(1);
      
      // Fetch new bill number after clearing
      if (user) {
        fetchNextBillNumber(user.id);
      }
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleShareWhatsApp = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name first');
      return;
    }
    toast.loading('Generating bill image...', { id: 'share-loading' });
    const result = await shareViaWhatsApp('generate-bill-container', billNumber);
    toast.dismiss('share-loading');
    
    if (result.success) {
      toast.success(result.message || 'Image downloaded! Opening WhatsApp...');
    } else {
      toast.error('Failed to generate bill image');
    }
    setShowShareMenu(false);
  };

  const handleShareNative = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name first');
      return;
    }
    toast.loading('Generating bill image...', { id: 'share-loading' });
    const result = await shareViaNativeShare('generate-bill-container', billNumber);
    toast.dismiss('share-loading');
    
    if (result.success) {
      toast.success(result.message || 'Shared successfully!');
    } else if (result.message !== 'Share cancelled') {
      toast.error(result.message || 'Failed to share');
    }
    setShowShareMenu(false);
  };

  const handleDownloadBill = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name first');
      return;
    }
    toast.loading('Generating bill image...', { id: 'download-loading' });
    const result = await downloadBillImage('generate-bill-container', billNumber);
    toast.dismiss('download-loading');
    
    if (result.success) {
      toast.success('Bill image downloaded!');
    } else {
      toast.error('Failed to download bill');
    }
    setShowShareMenu(false);
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.pageContainer}>
      <style jsx global>{`
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .bill-container {
            max-width: 100%;
            box-shadow: none;
            border: 3px solid #000;
            padding: 15px;
          }
          .header {
            border: 3px solid #000;
          }
          .bill-details,
          .items-table,
          .items-table th,
          .items-table td,
          .summary-section {
            border-color: #000;
          }
          .meta-item {
            border-color: #000;
          }
          input {
            border: none !important;
            background: transparent !important;
          }
          .items-table {
            border: 2px solid #000;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #000;
          }
        }
      `}</style>

      <div className="no-print" style={styles.topBar}>
        <button onClick={handleBack} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <h2 style={styles.pageTitle}>Generate New Bill</h2>
        <div style={{ position: 'relative' }}>
          <button onClick={handleShare} style={styles.shareBtn}>
            📤 Share
          </button>
          {showShareMenu && (
            <div style={styles.shareMenu}>
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
          )}
        </div>
      </div>

      <div id="generate-bill-container" className="bill-container" style={styles.billContainer}>
        {/* Header Section */}
        <div className="header" style={styles.header}>
          <div style={styles.shopInfo}>
            <h1 style={styles.shopName}>Prashant Event & Fireworks</h1>
            <p style={styles.address}>Badlapur</p>
            <p style={styles.mobile}>Mobile: 9766817766 / 9767611761</p>
          </div>
        </div>

        {/* Bill Details Section */}
        <div className="bill-details" style={styles.billDetails}>
          <div style={styles.billInfoRow}>
            <div style={styles.customerSection}>
              <label style={styles.label}>Customer Name:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={styles.input}
                placeholder="Enter Customer Name"
              />
            </div>
            <div style={styles.billMeta}>
              <div style={styles.metaItem}>
                <label style={styles.label}>Date:</label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  style={styles.inputSmall}
                />
              </div>
              <div style={styles.metaItem}>
                <label style={styles.label}>Bill No.:</label>
                <input
                  type="text"
                  value={billNumber}
                  readOnly
                  style={{...styles.inputSmall, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
                  title="Auto-generated bill number"
                />
              </div>
            </div>
          </div>
          <div style={styles.customerAddressRow}>
            <label style={styles.label}>Mobile/Address:</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              style={styles.input}
              placeholder="Customer Mobile/Address (Optional)"
            />
          </div>
        </div>

        {/* Items Table */}
        <div style={styles.itemsSection}>
          <table className="items-table" style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sr No.</th>
                <th style={styles.th}>Item Name</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Rate</th>
                <th style={styles.th}>Amount</th>
                <th className="no-print" style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    {item.itemName === 'Other' ? (
                      <input
                        type="text"
                        value={item.customItem}
                        onChange={(e) => updateItem(item.id, 'customItem', e.target.value)}
                        style={styles.tableInput}
                        placeholder="Enter custom item name"
                      />
                    ) : (
                      <select
                        value={item.itemName}
                        onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                        style={styles.tableSelect}
                      >
                        <option value="">Select Item</option>
                        {PREDEFINED_ITEMS.map(itemName => (
                          <option key={itemName} value={itemName}>{itemName}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      style={styles.tableInputNumber}
                      min="0"
                      step="1"
                      placeholder="0"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      value={item.rate || ''}
                      onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                      style={styles.tableInputNumber}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="text"
                      value={item.amount.toFixed(2)}
                      readOnly
                      style={styles.tableInputReadonly}
                    />
                  </td>
                  <td className="no-print" style={styles.td}>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={styles.removeBtn}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Item Button */}
        <div className="no-print" style={styles.buttonRow}>
          <button onClick={addItem} style={styles.addBtn}>+ Add Item</button>
        </div>

        {/* Amount Summary */}
        <div className="summary-section" style={styles.summarySection}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Total Amount:</span>
            <div style={styles.summaryAmount}>
              <span style={styles.summaryValue}>Total</span>
              <input
                type="text"
                value={calculateSubtotal().toFixed(2)}
                readOnly
                style={styles.summaryInput}
              />
            </div>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Advance Payment:</span>
            <input
              type="number"
              value={advancePayment}
              onChange={(e) => setAdvancePayment(e.target.value)}
              min="0"
              step="0.01"
              style={styles.summaryInput}
            />
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Balance Due:</span>
            <input
              type="text"
              value={calculateRemaining().toFixed(2)}
              readOnly
              style={styles.summaryInput}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.signature}>Prashant Event & Fireworks</p>
        </div>

        {/* Action Buttons */}
        <div className="no-print" style={styles.actionButtons}>
          <button onClick={handleSaveBill} style={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Bill'}
          </button>
          <div style={{position: 'relative'}}>
            <button onClick={handleShare} style={styles.shareBtn}>
              📤 Share Bill
            </button>
            {showShareMenu && (
              <div style={styles.shareMenu}>
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
            )}
          </div>
          <button onClick={handlePrint} style={styles.printBtn}>
            🖨️ Print Bill
          </button>
          <button onClick={clearBill} style={styles.clearBtn}>
            🗑️ Clear Bill
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 50%, #b71c1c 100%)',
    padding: '20px 40px',
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  pageTitle: {
    fontSize: '24px',
    color: '#ffffff',
    margin: 0,
    fontWeight: '600',
    letterSpacing: '0.5px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
  },
  billContainer: {
    maxWidth: '210mm',
    margin: '20px auto',
    backgroundColor: 'white',
    padding: '20px',
    border: '3px solid #d32f2f',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  header: {
    background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 50%, #b71c1c 100%)',
    padding: '25px 20px',
    marginBottom: '20px',
    textAlign: 'center',
    borderRadius: '8px 8px 0 0',
    boxShadow: '0 4px 6px rgba(211, 47, 47, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  shopInfo: {
    position: 'relative',
    zIndex: 1,
  },
  shopName: {
    fontSize: '36px',
    color: '#ffffff',
    marginBottom: '8px',
    fontWeight: '700',
    letterSpacing: '1px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    textTransform: 'uppercase',
  },
  address: {
    fontSize: '15px',
    marginBottom: '5px',
    color: '#ffebee',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
  mobile: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'inline-block',
    padding: '6px 20px',
    borderRadius: '20px',
    marginTop: '5px',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  billDetails: {
    border: '2px solid #d32f2f',
    padding: '10px',
    marginBottom: '15px',
  },
  billInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    gap: '20px',
    flexWrap: 'wrap',
  },
  customerSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: '250px',
  },
  billMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    minWidth: '200px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '2px solid #d32f2f',
    padding: '5px 10px',
  },
  customerAddressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    fontSize: '14px',
  },
  input: {
    flex: 1,
    padding: '5px',
    border: 'none',
    borderBottom: '1px solid #333',
    fontSize: '14px',
    outline: 'none',
  },
  inputSmall: {
    flex: 1,
    padding: '3px',
    border: 'none',
    borderBottom: '1px solid #333',
    fontSize: '14px',
    outline: 'none',
  },
  itemsSection: {
    marginBottom: '15px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '2px solid #d32f2f',
  },
  th: {
    backgroundColor: '#fff',
    border: '2px solid #d32f2f',
    padding: '8px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  td: {
    border: '2px solid #d32f2f',
    padding: '5px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  tableInput: {
    width: '100%',
    padding: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
    textAlign: 'left',
  },
  tableSelect: {
    width: '100%',
    padding: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
    cursor: 'pointer',
  },
  tableInputNumber: {
    width: '100%',
    padding: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
    textAlign: 'center',
  },
  tableInputReadonly: {
    width: '100%',
    padding: '5px',
    backgroundColor: '#f9f9f9',
    border: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  removeBtn: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '5px 10px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  buttonRow: {
    marginBottom: '15px',
    textAlign: 'center',
  },
  addBtn: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  summarySection: {
    border: '2px solid #d32f2f',
    padding: '10px',
    marginBottom: '15px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  summaryLabel: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  summaryAmount: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  summaryInput: {
    padding: '5px 10px',
    border: '1px solid #ccc',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: '120px',
  },
  footer: {
    padding: '15px 10px',
    textAlign: 'center',
  },
  signature: {
    fontSize: '14px',
    textAlign: 'right',
    marginTop: '40px',
  },
  actionButtons: {
    textAlign: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px dashed #ccc',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  saveBtn: {
    padding: '12px 28px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: '2px solid #4CAF50',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 3px 6px rgba(76, 175, 80, 0.3)',
    transition: 'all 0.3s ease',
  },
  shareBtn: {
    padding: '10px 24px',
    backgroundColor: '#ffffff',
    color: '#d32f2f',
    border: '2px solid #ffffff',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginLeft: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  printBtn: {
    padding: '12px 28px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: '2px solid #2196F3',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 3px 6px rgba(33, 150, 243, 0.3)',
    transition: 'all 0.3s ease',
  },
  clearBtn: {
    padding: '12px 28px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: '2px solid #ff9800',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 3px 6px rgba(255, 152, 0, 0.3)',
    transition: 'all 0.3s ease',
  },
  shareMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '150px',
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
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '20px',
    color: '#666',
  },
};
