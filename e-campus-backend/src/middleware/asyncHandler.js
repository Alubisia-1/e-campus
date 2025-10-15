/**
 * Async handler middleware
 * Wraps async functions to catch any errors and pass them to the error handler
 *
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;