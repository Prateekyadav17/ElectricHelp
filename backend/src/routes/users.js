const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// GET /api/users?role=electrician|staff|admin&q=search  (admin/staff)
router.get('/', auth(['admin','staff']), async (req, res) => {
  try {
    const { role, q } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    const users = await User.find(filter)
      .select('_id name email role department specialization phone');
    res.json(users);
  } catch (e) {
    console.error('GET /users error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users  (admin) — register staff/electrician/admin
// body: { name, email, password, role, department?, specialization?, phone? }
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { name, email, password, role, department, specialization, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }
    if (!['staff','electrician','admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const emailNorm = email.trim().toLowerCase();
    const exists = await User.findOne({ email: emailNorm });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: emailNorm,
      passwordHash,
      role,
      department: department || undefined,
      specialization: specialization || undefined,
      phone: phone || undefined
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      specialization: user.specialization,
      phone: user.phone
    });
  } catch (e) {
    console.error('POST /users error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id  (admin) — optional guard on assignments
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    // Prevent deletion if user currently has assigned complaints
    const hasAssigned = await Complaint.exists({ assignedTo: id });
    if (hasAssigned) {
      return res.status(409).json({ error: 'User has assigned complaints. Reassign before deleting.' });
    }

    const gone = await User.findByIdAndDelete(id);
    if (!gone) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error('DELETE /users/:id error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
