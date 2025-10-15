const { body, validationResult } = require('express-validator');

/**
 * Common validation rules
 */

// Email validation with sanitization
const emailValidator = () =>
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters');

// Password validation (minimum 6 characters)
const passwordValidator = (field = 'password') =>
  body(field)
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .isLength({ max: 100 })
    .withMessage('Password must not exceed 100 characters');

// Simple password validator (for backward compatibility)
const simplePasswordValidator = () =>
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long');

// Name validation with XSS sanitization
const nameValidator = () =>
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens and apostrophes')
    .escape(); // Sanitize against XSS

// Phone number validation (international format)
const phoneValidator = (field = 'phone', required = false) => {
  const validator = body(field)
    .optional(!required)
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number in international format (e.g., +1234567890)');

  return required ? validator.notEmpty().withMessage('Phone number is required') : validator;
};

// Text sanitization (prevents XSS)
const textSanitizer = (field, minLength, maxLength, required = true) => {
  const validator = body(field)
    .trim()
    .escape() // Escape HTML characters
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`);

  return required
    ? validator.notEmpty().withMessage(`${field} is required`)
    : validator.optional();
};

// URL validation
const urlValidator = (field) =>
  body(field)
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL');

// MongoDB ObjectId validation
const mongoIdValidator = (field) =>
  body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isMongoId()
    .withMessage(`Invalid ${field} format`);

// Price validation
const priceValidator = () =>
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0, max: 999999 })
    .withMessage('Price must be a positive number less than 1,000,000')
    .toFloat();

// Array validation
const arrayValidator = (field, minItems = 1, maxItems = 10) =>
  body(field)
    .isArray({ min: minItems, max: maxItems })
    .withMessage(`${field} must be an array with ${minItems} to ${maxItems} items`);

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Sanitize user input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeInput(obj);
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

module.exports = {
  emailValidator,
  passwordValidator,
  simplePasswordValidator,
  nameValidator,
  phoneValidator,
  textSanitizer,
  urlValidator,
  mongoIdValidator,
  priceValidator,
  arrayValidator,
  validate,
  sanitizeInput,
  sanitizeObject
};
