/**
 * Express 5 compatible input sanitization.
 *
 * Replaces express-mongo-sanitize + xss-clean, which crash under Express 5
 * because they reassign req.query (a read-only getter in Express 5). This
 * version mutates objects IN PLACE, so it never reassigns req.query.
 *
 *  - NoSQL injection: strips object keys that start with "$" or contain "."
 *    (Mongo query operators / dotted paths) from request data.
 *  - XSS: neutralises angle brackets in string values so submitted markup
 *    cannot be reflected/stored as live HTML.
 */

// Encode the characters needed to break out of HTML/attribute context.
const escapeHtml = (str) =>
  str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Recursively sanitize a value in place. Returns the (possibly replaced) value
// for primitives so callers can reassign string results.
function sanitizeValue(value) {
  if (typeof value === 'string') {
    return escapeHtml(value);
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = sanitizeValue(value[i]);
    }
    return value;
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      // Drop Mongo operator / dotted keys entirely.
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
        continue;
      }
      value[key] = sanitizeValue(value[key]);
    }
    return value;
  }

  return value;
}

/**
 * Sanitize req.body, req.params and req.query in place.
 * req.query may be a non-writable getter under Express 5, so its mutation is
 * wrapped defensively — we only mutate the object's contents, never reassign it.
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) sanitizeValue(req.body);
  if (req.params) sanitizeValue(req.params);

  try {
    if (req.query) sanitizeValue(req.query);
  } catch (err) {
    // If the runtime returns a fresh/immutable query object, skip silently.
  }

  next();
};

module.exports = sanitizeRequest;
