import clientPromise from '../lib/mongodb';
import bcrypt from 'bcryptjs';

export async function getUserByUsername(username) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    const user = await db.collection('User').findOne({ username });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUserById(userId) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    const { ObjectId } = require('mongodb');
    const user = await db.collection('User').findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

export async function createUser(userData) {
  try {
    const client = await clientPromise;
    const db = client.db('mandap-planner');
    
    // Check if user already exists
    const existingUser = await db.collection('User').findOne({ username: userData.username });
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const result = await db.collection('User').insertOne({
      username: userData.username,
      password: hashedPassword,
      name: userData.name || userData.username,
      createdAt: new Date(),
    });
    
    return { success: true, userId: result.insertedId };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}
