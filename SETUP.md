# Quick Setup Guide

Follow these steps to get your Bill Book Management System up and running.

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages:
- next
- react
- react-dom
- mongodb
- bcryptjs

## Step 2: Verify MongoDB Connection

The MongoDB connection is already configured:
- **URI:** `mongodb+srv://vishalbhopi:vishalbhopi@cluster0.xa7hyrs.mongodb.net/mandap-planner`
- **Database:** `mandap-planner`

Make sure you have:
1. A `User` collection in your database
2. At least one user account to login

## Step 3: Create a Test User

### Option A: Using the helper script

```bash
node scripts/createUser.js
```

Edit the script first to set your desired username and password.

### Option B: Using the register API

Start the dev server first:
```bash
npm run dev
```

Then in another terminal:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","name":"Admin User"}'
```

### Option C: Manually in MongoDB

If you have MongoDB access, insert directly:
```javascript
// First hash the password
const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('yourpassword', 10);

// Then insert
db.User.insertOne({
  username: 'admin',
  password: hashedPassword,
  name: 'Admin User',
  createdAt: new Date()
});
```

## Step 4: Start the Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

## Step 5: Login

1. Open `http://localhost:3000` in your browser
2. Enter your username and password
3. Click "Login"

## Step 6: Start Using the System

After login, you can:
1. **Generate Bills** - Create new bills with items, quantities, and rates
2. **View Bills** - See all your saved bills, search, print, or delete them

## Troubleshooting

### Cannot connect to MongoDB
- Verify your internet connection
- Check if the MongoDB URI is correct
- Ensure your IP is whitelisted in MongoDB Atlas

### Login fails
- Make sure you have a user in the `User` collection
- Verify the password is correctly hashed with bcrypt
- Check browser console for errors

### Port 3000 already in use
- Stop any other processes using port 3000
- Or change the port: `PORT=3001 npm run dev`

## Production Deployment

### For Vercel:
1. Push code to GitHub
2. Import in Vercel
3. Set environment variables:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET` (generate a random string)
   - `NEXTAUTH_URL` (your production URL)
4. Deploy

### For other platforms:
- Ensure Node.js 14+ is available
- Run `npm run build` then `npm start`
- Set all environment variables

## Support

For help or issues:
1. Check the README.md file
2. Review the code comments
3. Check browser console for errors
4. Verify MongoDB connection

---

**Happy billing! 📝**
