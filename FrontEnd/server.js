require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('./models/User');
const authRoutes = require('./routes/auth');
require('./config/passport')(passport);

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Get all questions
app.get('/api/questions', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const questions = await db.collection('questions').find({}).toArray();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get security question for a user
app.get('/api/user-question', async (req, res) => {
  const username = req.query.username;
  try {
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ username });
    if (user) {
      const question = await db.collection('questions').findOne({ _id: user.securityQuestionId });
      res.json({ question: question?.text });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error fetching question' });
  }
});

// Generate PIN and send to user email
app.post('/api/generate-pin', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

  const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN

  try {
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await db.collection('users').updateOne(
      { username },
      { $set: { pin, pinGeneratedAt: new Date() } }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Password Reset" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your Verification PIN',
      text: `Hello ${username},\n\nYour verification PIN is: ${pin}\n\nThis PIN will expire in 10 minutes.`,
    });

    res.json({ success: true, message: 'PIN sent to email' });
  } catch (err) {
    console.error('Error generating PIN:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Verify PIN
app.post('/api/verify-pin', async (req, res) => {
  const { username, pin } = req.body;

  if (!username || !pin) {
    return res.status(400).json({ success: false, message: 'Username and PIN required.' });
  }

  try {
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ username });

    if (!user || !user.pin || !user.pinGeneratedAt) {
      return res.status(404).json({ success: false, message: 'Invalid user or PIN.' });
    }

    const pinAge = Date.now() - new Date(user.pinGeneratedAt).getTime();
    const isExpired = pinAge > 10 * 60 * 1000; // 10 minutes

    if (user.pin === pin && !isExpired) {
      // Clear PIN after successful verification
      await db.collection('users').updateOne(
        { username },
        { $unset: { pin: "", pinGeneratedAt: "" } }
      );
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid or expired PIN.' });
    }
  } catch (err) {
    console.error('PIN verification error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Sessions & Auth
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard.html');
  }
);

// Middleware for route protection
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/LoginPage.html');
}

function ensureReadOnly(req, res, next) {
  if (req.user.role === 'read-only') return next();
  res.status(403).send('Access denied');
}

// Dashboard (Protected)
app.get('/dashboard.html', ensureAuth, ensureReadOnly, (req, res) => {
  res.send(`<h1>Welcome, ${req.user.displayName}</h1><p>You have read-only access.</p>`);
});

// Root Route
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

// Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
