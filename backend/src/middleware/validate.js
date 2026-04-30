/**
 * Zod validation middleware factory
 * Validates req.body against the provided Zod schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // Replace body with parsed/sanitized data
    next();
  } catch (error) {
    const errors = error.errors?.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors || [{ message: error.message }],
    });
  }
};

module.exports = validate;
