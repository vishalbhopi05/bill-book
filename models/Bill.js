import clientPromise from '../lib/mongodb';

export async function createBill(billData, userId) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    
    const bill = {
      ...billData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('bills').insertOne(bill);
    return { success: true, billId: result.insertedId };
  } catch (error) {
    console.error('Error creating bill:', error);
    return { success: false, error: error.message };
  }
}

export async function getBillsByUserId(userId) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    
    const bills = await db.collection('bills')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return bills;
  } catch (error) {
    console.error('Error fetching bills:', error);
    return [];
  }
}

export async function getBillById(billId) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    const { ObjectId } = require('mongodb');
    
    const bill = await db.collection('bills').findOne({ _id: new ObjectId(billId) });
    return bill;
  } catch (error) {
    console.error('Error fetching bill:', error);
    return null;
  }
}

export async function updateBill(billId, billData, userId = null) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    const { ObjectId } = require('mongodb');
    
    // If userId is provided, verify the bill belongs to the user
    if (userId) {
      const bill = await db.collection('bills').findOne({ 
        _id: new ObjectId(billId),
        userId 
      });
      
      if (!bill) {
        return { success: false, error: 'Bill not found or unauthorized' };
      }
    }
    
    const result = await db.collection('bills').updateOne(
      { _id: new ObjectId(billId) },
      { 
        $set: {
          ...billData,
          updatedAt: new Date(),
        }
      }
    );
    
    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error('Error updating bill:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBill(billId) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    const { ObjectId } = require('mongodb');
    
    const result = await db.collection('bills').deleteOne({ _id: new ObjectId(billId) });
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Error deleting bill:', error);
    return { success: false, error: error.message };
  }
}

export async function searchBills(userId, searchQuery) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    
    const bills = await db.collection('bills')
      .find({
        userId,
        $or: [
          { customerName: { $regex: searchQuery, $options: 'i' } },
          { billNumber: { $regex: searchQuery, $options: 'i' } },
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return bills;
  } catch (error) {
    console.error('Error searching bills:', error);
    return [];
  }
}
