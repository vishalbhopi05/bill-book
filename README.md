# Bill Book Management System - Next.js

A complete bill management system built with Next.js and MongoDB for **Prashant Event & Fireworks**.

## Features

- 🔐 **User Authentication** - Login system using existing MongoDB User database
- 📝 **Generate Bills** - Create professional bills with multiple items
- ✏️ **Edit Bills** - Modify existing bills and track additional payments
- 🔢 **Auto Bill Numbering** - Automatic bill number generation (BILL-0001, BILL-0002, etc.)
- 💰 **Payment Tracking** - Track advance payments and additional payments
- 📋 **View Bills** - Browse and search all saved bills
- 🖨️ **Print Bills** - Print-optimized bill format
- 📤 **Share Bills** - Share via WhatsApp, copy to clipboard, or native share
- 💾 **Save to Database** - All bills are saved to MongoDB
- 🔍 **Search Functionality** - Search bills by customer name or bill number
- 📱 **Mobile Responsive** - Works on all devices

## Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Authentication:** Custom authentication with localStorage
- **Language:** JavaScript (No TypeScript)

## Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database access

## Installation

1. **Clone or download the project**

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**

The MongoDB connection is already configured in `next.config.js`:
```
mongodb+srv://vishalbhopi:vishalbhopi@cluster0.xa7hyrs.mongodb.net/mandap-planner
```

If you need to change it, edit `next.config.js` file.

4. **Setup MongoDB Database**

Make sure you have a `User` collection in your MongoDB database with the following structure:
```javascript
{
  username: String,
  password: String (hashed with bcrypt),
  name: String,
  createdAt: Date
}
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Usage

### 1. Login
- Open `http://localhost:3000`
- Enter your username and password from the User database
- Click "Login"

### 2. Dashboard
After login, you'll see two options:
- **Generate Bill** - Create a new bill
- **View Bills** - See all your saved bills

### 3. Generate Bill
- **Bill number is automatically generated** (e.g., BILL-0001, BILL-0002, etc.)
- Enter customer details (name, address, date)
- Add items using the dropdown or enter custom items
- Enter quantity and rate (amount is auto-calculated)
- Click "Save Bill" to save to database (bill number auto-increments)
- Click "Print Bill" to print
- Click "Clear Bill" to reset the form and get a new bill number

### 4. View Bills
- See all your bills in a grid layout
- Search by customer name or bill number
- Click "View" to see full bill details
- Click "Edit" to modify bill and add payments
- Click "Delete" to remove a bill
- Print individual bills from the detail view

### 5. Edit Bills
- Click "Edit" on any bill card
- Modify customer details, items, quantities, or rates
- **Add additional payments** - Track payments made after initial advance
- System automatically calculates:
  - Total Paid = Advance Payment + Additional Payment
  - Balance Due = Total Amount - Total Paid
- Save changes with one click

## Project Structure

```
bill-book-nextjs/
├── lib/
│   └── mongodb.js          # MongoDB connection
├── models/
│   ├── User.js             # User model and methods
│   └── Bill.js             # Bill model and methods
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.js    # Login API
│   │   │   └── register.js # Register API
│   │   └── bills/
│   │       ├── create.js   # Create bill API
│   │       ├── list.js     # List bills API
│   │       └── [id].js     # Get/Update/Delete bill API
│   ├── _app.js             # Next.js app wrapper
│   ├── index.js            # Login page
│   ├── dashboard.js        # Dashboard page
│   ├── generate-bill.js    # Generate bill page
│   ├── bills.js            # View bills page
│   └── edit-bill/
│       └── [id].js         # Edit bill page (dynamic route)
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user

### Bills
- `POST /api/bills/create` - Create a new bill (auto-generates bill number)
- `GET /api/bills/next-number?userId={id}` - Get next available bill number
- `GET /api/bills/list?userId={id}&search={query}` - List all bills
- `GET /api/bills/[id]` - Get single bill
- `PUT /api/bills/[id]` - Update bill
- `DELETE /api/bills/[id]` - Delete bill

## Database Collections

### User Collection
```javascript
{
  _id: ObjectId,
  username: String,
  password: String (bcrypt hashed),
  name: String,
  createdAt: Date
}
```

### bills Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  customerName: String,
  customerAddress: String,
  billNumber: String (auto-generated: BILL-0001, BILL-0002, etc.),
  billDate: Date,
  items: [
    {
      id: Number,
      itemName: String,
      customItem: String,
      quantity: Number,
      rate: Number,
      amount: Number
    }
  ],
  subtotal: Number,
  advancePayment: Number,
  additionalPayment: Number (NEW - for tracking subsequent payments),
  totalPaid: Number (NEW - sum of all payments),
  remainingAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### counters Collection (auto-created)
```javascript
{
  _id: ObjectId,
  userId: String,
  type: String ('billNumber'),
  sequence: Number (current count)
}
```

## Creating a Test User

To create a test user, you can use the register API or directly insert into MongoDB:

```javascript
// Using bcrypt to hash password
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('yourpassword', 10);

// Insert into MongoDB
db.User.insertOne({
  username: 'admin',
  password: hashedPassword,
  name: 'Admin User',
  createdAt: new Date()
});
```

Or use the register API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","name":"Admin User"}'
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
Make sure to set the following environment variables:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Support

For issues or questions, contact the development team.

## License

Private - Prashant Event & Fireworks

---

**Built with ❤️ for Prashant Event & Fireworks, Badlapur**
