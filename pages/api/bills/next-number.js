import { getCurrentBillNumber } from '../../../models/Counter';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get the next bill number (without incrementing)
    const nextBillNumber = await getCurrentBillNumber(userId);

    return res.status(200).json({
      success: true,
      billNumber: nextBillNumber,
    });
  } catch (error) {
    console.error('Get next bill number error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
