const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'counsellor', 'admin']).withMessage('Invalid role'),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const postValidation = [
  body('content').trim().notEmpty().isLength({ max: 5000 }).withMessage('Content is required (max 5000 chars)'),
  body('category').optional().isIn(['General', 'Academics', 'Relationships', 'Mental Health', 'Social Life']),
  body('isAnonymous').optional().isBoolean(),
  validate
];

const moodValidation = [
  body('moodScore').isInt({ min: 1, max: 5 }).withMessage('Mood score must be between 1 and 5'),
  body('note').optional().isLength({ max: 500 }),
  validate
];

const appointmentValidation = [
  body('counsellorId').notEmpty().withMessage('Counsellor ID is required'),
  body('dateTime').isISO8601().withMessage('Valid date/time is required'),
  body('duration').optional().isInt({ min: 15, max: 120 }),
  body('isAnonymous').optional().isBoolean(),
  validate
];

const resourceValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['article', 'video', 'audio', 'pdf']).withMessage('Valid resource type required'),
  body('category').isIn(['Anxiety', 'Depression', 'Stress', 'Relationships', 'Academic', 'General']).withMessage('Valid category required'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  postValidation,
  moodValidation,
  appointmentValidation,
  resourceValidation
};
