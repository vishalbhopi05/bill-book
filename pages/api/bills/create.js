import { createBill } from '../../../models/Bill';
import { getNextBillNumber } from '../../../models/Counter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, billData } = req.body;

    if (!userId || !billData) {
      return res.status(400).json({ message: 'User ID and bill data are required' });
    }

    // Generate next bill number automatically
    const billNumber = await getNextBillNumber(userId);

    // Add the auto-generated bill number to the bill data
    const billDataWithNumber = {
      ...billData,
      billNumber,
    };

    // Create bill
    const result = await createBill(billDataWithNumber, userId);

    if (!result.success) {
      return res.status(400).json({ message: result.error || 'Failed to create bill' });
    }

    return res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      billId: result.billId,
      billNumber,
    });
  } catch (error) {
    console.error('Create bill error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
