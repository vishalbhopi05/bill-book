import { getBillsByUserId, searchBills } from '../../../models/Bill';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, search } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch bills
    let bills;
    if (search) {
      bills = await searchBills(userId, search);
    } else {
      bills = await getBillsByUserId(userId);
    }

    // Convert ObjectId to string for JSON serialization
    const serializedBills = bills.map(bill => ({
      ...bill,
      _id: bill._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      bills: serializedBills,
    });
  } catch (error) {
    console.error('Fetch bills error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
