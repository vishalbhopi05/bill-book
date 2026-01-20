import { createUser } from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password, name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Create user
    const result = await createUser({ username, password, name });

    if (!result.success) {
      return res.status(400).json({ message: result.error || 'Failed to create user' });
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.userId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
