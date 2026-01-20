import clientPromise from '../lib/mongodb';

// Get next bill number for a user
export async function getNextBillNumber(userId) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    
    // Find and update the counter for this user
    const result = await db.collection('counters').findOneAndUpdate(
      { userId, type: 'billNumber' },
      { $inc: { sequence: 1 } },
      { 
        upsert: true, 
        returnDocument: 'after'
      }
    );
    
    // Format as BILL-0001, BILL-0002, etc.
    const billNumber = `BILL-${String(result.sequence).padStart(4, '0')}`;
    return billNumber;
  } catch (error) {
    console.error('Error getting next bill number:', error);
    // Fallback to timestamp-based number
    return `BILL-${Date.now()}`;
  }
}

// Get current bill number without incrementing
export async function getCurrentBillNumber(userId) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    
    const counter = await db.collection('counters').findOne({ 
      userId, 
      type: 'billNumber' 
    });
    
    if (!counter) {
      return 'BILL-0001'; // First bill
    }
    
    const nextNumber = counter.sequence + 1;
    return `BILL-${String(nextNumber).padStart(4, '0')}`;
  } catch (error) {
    console.error('Error getting current bill number:', error);
    return `BILL-${Date.now()}`;
  }
}

// Reset counter (admin function)
export async function resetBillCounter(userId, startFrom = 0) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    
    await db.collection('counters').updateOne(
      { userId, type: 'billNumber' },
      { $set: { sequence: startFrom } },
      { upsert: true }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error resetting counter:', error);
    return { success: false, error: error.message };
  }
}
