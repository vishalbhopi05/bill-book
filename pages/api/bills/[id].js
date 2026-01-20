import { getBillById, updateBill, deleteBill } from '../../../models/Bill';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Bill ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get single bill
      const bill = await getBillById(id);
      
      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }

      // Convert ObjectId to string
      const serializedBill = {
        ...bill,
        _id: bill._id.toString(),
      };

      return res.status(200).json({
        success: true,
        bill: serializedBill,
      });
    } else if (req.method === 'PUT') {
      // Update bill
      const { billData } = req.body;
      const result = await updateBill(id, billData);

      if (!result.success) {
        return res.status(400).json({ message: result.error || 'Failed to update bill' });
      }

      return res.status(200).json({
        success: true,
        message: 'Bill updated successfully',
      });
    } else if (req.method === 'DELETE') {
      // Delete bill
      const result = await deleteBill(id);

      if (!result.success) {
        return res.status(400).json({ message: result.error || 'Failed to delete bill' });
      }

      return res.status(200).json({
        success: true,
        message: 'Bill deleted successfully',
      });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Bill operation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
