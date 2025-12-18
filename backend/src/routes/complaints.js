const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Complaint = require('../models/Complaint');

// POST /api/complaints (staff/admin create)
router.post('/', auth(['staff','admin']), async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let {
      title, description, location,
      priority, category, images,
      visibleToAll, assignedTo
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // sanitize and defaults
    title = title.trim();
    description = description || '';
    location = location || '';
    priority = priority || 'medium';
    category = category || 'electrical';
    images = Array.isArray(images) ? images : [];
    const visAll = !!visibleToAll;

    // accept only a valid ObjectId when not visibleToAll
    const isObjId = (v) => typeof v === 'string' && v.length === 24;
    const assignId = visAll ? null : (isObjId(assignedTo) ? assignedTo : null);

    const doc = await Complaint.create({
      title, description, location, priority, category, images,
      createdBy: req.user.id,
      visibleToAll: visAll,
      assignedTo: assignId
    });

    const populated = await Complaint.findById(doc._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json(populated);
  } catch (e) {
    console.error('POST /complaints error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/complaints/mine (staff)
router.get('/mine', auth(['staff']), async (req, res) => {
  try {
    const items = await Complaint.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email role');
    res.json(items);
  } catch (e) {
    console.error('GET /complaints/mine error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/complaints/for-electrician (electrician)
router.get('/for-electrician', auth(['electrician']), async (req, res) => {
  try {
    const items = await Complaint.find({
      $or: [
        { visibleToAll: true },
        { assignedTo: req.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');
    res.json(items);
  } catch (e) {
    console.error('GET /complaints/for-electrician error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/complaints (admin/staff) with optional ?assignedTo=<userId|any|unassigned>
router.get('/', auth(['admin','staff']), async (req, res) => {
  try {
    const { assignedTo } = req.query;
    let filter = {};
    if (assignedTo === 'any') {
      filter.visibleToAll = true;
    } else if (assignedTo === 'unassigned') {
      filter.$and = [{ visibleToAll: { $ne: true } }, { assignedTo: null }];
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    const items = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    res.json(items);
  } catch (e) {
    console.error('GET /complaints error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/complaints/:id/assign (admin)
router.patch('/:id/assign', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, visibleToAll } = req.body;

    const update = {
      visibleToAll: !!visibleToAll,
      assignedTo: visibleToAll ? null : (typeof assignedTo === 'string' && assignedTo.length === 24 ? assignedTo : null)
    };

    const doc = await Complaint.findByIdAndUpdate(id, update, { new: true })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    console.error('PATCH /complaints/:id/assign error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/complaints/:id/status (electrician)
router.patch('/:id/status', auth(['electrician']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const allowed = ['pending', 'in-progress', 'resolved', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Only update if complaint is visible to this electrician
    const task = await Complaint.findOne({
      _id: id,
      $or: [{ visibleToAll: true }, { assignedTo: req.user.id }]
    });
    if (!task) return res.status(404).json({ error: 'Not found or not allowed' });

    task.status = status;
    if (comment && comment.trim()) {
      task.comments = task.comments || [];
      task.comments.push({ text: comment.trim(), by: req.user.id, at: new Date() });
    }
    await task.save();

    const populated = await Complaint.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json(populated);
  } catch (e) {
    console.error('PATCH /complaints/:id/status error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
