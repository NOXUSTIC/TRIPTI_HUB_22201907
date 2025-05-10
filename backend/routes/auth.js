  
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');

// Sign Up route
router.post('/signup', async (req, res) => {
  const { name, studentId, dormName, roomNumber, email, password } = req.body;

  if (!name || !dormName || !roomNumber || !email || !password) {
    return res.json({ success: false, message: 'All fields are required' });
  }

  try {
    // Check if email already exists in admin or students table
    if (email.endsWith('@bracu.ac.bd')) {
      const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
      if (rows.length > 0) {
        return res.json({ success: false, message: 'Email already registered' });
      }
    } else {
      const [rows] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
      if (rows.length > 0) {
        return res.json({ success: false, message: 'Email already registered' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (email.endsWith('@bracu.ac.bd')) {
      // Insert new admin
      await db.query(
        'INSERT INTO admin (name, email, roomNumber, dormName, password) VALUES (?, ?, ?, ?, ?)',
        [name, email, roomNumber, dormName, hashedPassword]
      );
    } else {
      // Insert new student
      if (!studentId) {
        return res.json({ success: false, message: 'Student ID is required for student signup' });
      }
      await db.query(
        'INSERT INTO students (name, studentId, dormName, roomNumber, email, password) VALUES (?, ?, ?, ?, ?, ?)',
        [name, studentId, dormName, roomNumber, email, hashedPassword]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Signup error:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// Sign In route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password are required' });
  }

  try {
    let user;
    let userType;

    if (email.endsWith('@bracu.ac.bd')) {
      const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.json({ success: false, message: 'Invalid email or password' });
      }
      user = rows[0];
      userType = 'admin';
    } else {
      const [rows] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.json({ success: false, message: 'Invalid email or password' });
      }
      user = rows[0];
      userType = 'student';
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    if (userType === 'admin') {
      res.json({ success: true, admin: { name: user.name, dormName: user.dormName, roomNumber: user.roomNumber, email: user.email } });
    } else {
      res.json({ success: true, student: { name: user.name, dormName: user.dormName, studentId: user.studentId, email: user.email } });
    }

  } catch (err) {
    console.error('Signin error:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// Password reset route with captcha validation
router.post('/reset-password', async (req, res) => {
  const { email, newPassword, captchaResult, num1, num2, operation } = req.body;

  if (!email || !newPassword || !captchaResult || !num1 || !num2 || !operation) {
    return res.json({ success: false, message: 'All fields are required' });
  }

  // Validate captcha result
  let validResult;
  switch (operation) {
    case 'add':
      validResult = num1 + num2;
      break;
    case 'subtract':
      validResult = num1 - num2;
      break;
    case 'multiply':
      validResult = num1 * num2;
      break;
    default:
      return res.json({ success: false, message: 'Invalid operation' });
  }

  if (parseFloat(captchaResult) !== validResult) {
    return res.json({ success: false, message: 'Captcha validation failed' });
  }

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const [result] = await db.query('UPDATE students SET password = ? WHERE email = ?', [hashedPassword, email]);

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'Email not found' });
    }

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});


router.get('/students/count', async (req, res) => {
  try {
    // Assuming no sign-in tracking, return total number of students
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM students');
    const count = rows[0].count;
    res.json({ success: true, count });
  } catch (err) {
    console.error('Error fetching student count:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// Create months table if not exists
db.query(`
  CREATE TABLE IF NOT EXISTS months (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month_name VARCHAR(20) NOT NULL UNIQUE,
    token_allocation INT NOT NULL DEFAULT 400
  )
`).catch(err => {
  console.error('Error creating months table:', err);
});

// GET selected months
router.get('/months', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT month_name, token_allocation FROM months');
    res.json({ success: true, months: rows });
  } catch (err) {
    console.error('Error fetching months:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// POST save selected months (only if none exist)
router.post('/months', async (req, res) => {
  const { months } = req.body; // expecting array of month names
  if (!Array.isArray(months) || months.length !== 3) {
    return res.json({ success: false, message: 'Exactly 3 months must be selected' });
  }
  try {
    // Check if months already exist
    const [existing] = await db.query('SELECT COUNT(*) AS count FROM months');
    if (existing[0].count > 0) {
      return res.json({ success: false, message: 'Months already configured and cannot be changed' });
    }
    // Insert months with token_allocation 400 each
    const values = months.map(m => [m, 400]);
    await db.query('INSERT INTO months (month_name, token_allocation) VALUES ?', [values]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving months:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// New route to reset months configuration with captcha validation
router.post('/reset-months', async (req, res) => {
  const { captchaResult, num1, num2, operation } = req.body;

  if (!captchaResult || !num1 || !num2 || !operation) {
    return res.json({ success: false, message: 'All fields are required' });
  }

  // Validate captcha result
  let validResult;
  switch (operation) {
    case 'add':
      validResult = num1 + num2;
      break;
    case 'subtract':
      validResult = num1 - num2;
      break;
    case 'multiply':
      validResult = num1 * num2;
      break;
    case 'divide':
      if (num2 === 0) {
        return res.json({ success: false, message: 'Division by zero is not allowed' });
      }
      validResult = num1 / num2;
      break;
    default:
      return res.json({ success: false, message: 'Invalid operation' });
  }

  if (parseFloat(captchaResult) !== validResult) {
    return res.json({ success: false, message: 'Captcha validation failed' });
  }

  try {
    // Delete all months to reset configuration
    await db.query('DELETE FROM months');
    res.json({ success: true, message: 'Months configuration reset successfully' });
  } catch (err) {
    console.error('Reset months error:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// GET count of students who have logged in
router.get('/logged-in-students-count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(DISTINCT student_id) AS count FROM student_data WHERE logged_in = 1');
    const count = rows[0].count;
    res.json({ success: true, count });
  } catch (err) {
    console.error('Error fetching logged-in students count:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// GET total tokens used confirmed by students
router.get('/tokens-used', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT SUM(tokens_confirmed) AS totalTokensUsed FROM Food_table');
    const totalTokensUsed = rows[0].totalTokensUsed || 0;
    res.json({ success: true, totalTokensUsed });
  } catch (err) {
    console.error('Error fetching tokens used:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// GET orders summary for Chicken, Beef, Mutton, Fish
router.get('/orders-summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        SUM(CASE WHEN item = 'Chicken' THEN quantity ELSE 0 END) AS chickenOrder,
        SUM(CASE WHEN item = 'Beef' THEN quantity ELSE 0 END) AS beefOrder,
        SUM(CASE WHEN item = 'Mutton' THEN quantity ELSE 0 END) AS muttonOrder,
        SUM(CASE WHEN item = 'Fish' THEN quantity ELSE 0 END) AS fishOrder,
        SUM(CASE WHEN item = 'Duck' THEN quantity ELSE 0 END) AS duckOrder
      FROM Food_table
    `);
    const summary = rows[0];
    res.json({ success: true, summary });
  } catch (err) {
    console.error('Error fetching orders summary:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// GET count of signed-up students
router.get('/signed-up-students-count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM students');
    const count = rows[0].count;
    res.json({ success: true, count });
  } catch (err) {
    console.error('Error fetching signed-up students count:', err);
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
