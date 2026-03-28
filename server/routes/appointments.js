const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { appointmentValidation } = require('../middleware/validation');
const Appointment = require('../models/Appointment');
const Counsellor = require('../models/Counsellor');
const User = require('../models/User');
const { sendAppointmentConfirmation } = require('../services/email');

const router = express.Router();

// Get appointments (filtered by role)
router.get('/', auth, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (req.user.role === 'student') {
      filter.studentId = req.userId;
    } else if (req.user.role === 'counsellor') {
      const counsellor = await Counsellor.findOne({ userId: req.userId });
      if (counsellor) filter.counsellorId = counsellor._id;
    }
    // Admin sees all

    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .sort({ dateTime: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('studentId', 'name email anonymousId')
      .populate({
        path: 'counsellorId',
        populate: { path: 'userId', select: 'name email avatar' }
      });

    const total = await Appointment.countDocuments(filter);

    // Mask identity if anonymous
    const masked = appointments.map(apt => {
      const obj = apt.toObject();
      if (obj.isAnonymous && req.user.role !== 'admin') {
        obj.studentId = { name: obj.studentId?.anonymousId || 'Anonymous', email: 'hidden' };
      }
      return obj;
    });

    res.json({ appointments: masked, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// Book appointment
router.post('/', auth, appointmentValidation, async (req, res, next) => {
  try {
    const { counsellorId, dateTime, duration, isAnonymous, notes } = req.body;

    const counsellor = await Counsellor.findById(counsellorId).populate('userId', 'name email');
    if (!counsellor || !counsellor.isActive) {
      return res.status(404).json({ message: 'Counsellor not found or unavailable' });
    }

    // Check for time conflict
    const conflictWindow = new Date(dateTime);
    const conflict = await Appointment.findOne({
      counsellorId,
      dateTime: { $gte: new Date(conflictWindow.getTime() - 60 * 60000), $lte: new Date(conflictWindow.getTime() + 60 * 60000) },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict) {
      return res.status(400).json({ message: 'This time slot is not available' });
    }

    // Generate a real Jitsi Meet link (free, no API key needed)
    const roomId = `MindMate-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const meetingLink = `https://meet.jit.si/${roomId}`;

    const appointment = new Appointment({
      studentId: req.userId,
      counsellorId,
      dateTime,
      duration: duration || 60,
      status: 'confirmed',
      meetingLink,
      isAnonymous: isAnonymous || false,
      notes
    });

    await appointment.save();

    // Send email confirmation
    sendAppointmentConfirmation(
      req.user.email,
      req.user.name,
      dateTime,
      counsellor.userId.name
    ).catch(console.error);

    res.status(201).json({ appointment });
  } catch (error) {
    next(error);
  }
});

// Update appointment
router.patch('/:id', auth, async (req, res, next) => {
  try {
    const { status, notes, dateTime } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (dateTime) appointment.dateTime = dateTime;

    await appointment.save();
    res.json({ appointment });
  } catch (error) {
    next(error);
  }
});

// Cancel appointment
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    next(error);
  }
});

// Add counsellor note/suggestion to appointment
router.post('/:id/notes', auth, authorize('counsellor', 'admin'), async (req, res, next) => {
  try {
    const { text, type } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.counsellorNotes.push({
      text: text.trim(),
      type: type || 'general',
      createdAt: new Date()
    });

    await appointment.save();
    
    const updated = await Appointment.findById(req.params.id)
      .populate('studentId', 'name email anonymousId')
      .populate({ path: 'counsellorId', populate: { path: 'userId', select: 'name email avatar' } });

    res.json({ appointment: updated });
  } catch (error) {
    next(error);
  }
});

// Get counsellors
router.get('/counsellors', auth, async (req, res, next) => {
  try {
    const counsellors = await Counsellor.find({ isActive: true })
      .populate('userId', 'name email avatar language');
    res.json({ counsellors });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
