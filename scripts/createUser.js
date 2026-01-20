// Helper script to create a user in MongoDB
// Run with: node scripts/createUser.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://vishalbhopi:vishalbhopi@cluster0.xa7hyrs.mongodb.net/mandap-planner';

async function createUser() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('mandap-planner');
    
    // User details - CHANGE THESE
    const username = 'admin';
    const password = 'admin123';
    const name = 'Admin User';

    // Check if user exists
    const existingUser = await db.collection('User').findOne({ username });
    if (existingUser) {
      console.log('❌ User already exists!');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.collection('User').insertOne({
      username,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    });

    console.log('✅ User created successfully!');
    console.log('User ID:', result.insertedId);
    console.log('\nLogin credentials:');
    console.log('Username:', username);
    console.log('Password:', password);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

createUser();
