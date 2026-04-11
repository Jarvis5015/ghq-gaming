// middleware/validate.middleware.js
// Checks request body for errors after express-validator runs

const { validationResult } = require('express-validator')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Return first error message nicely
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    })
  }
  next()
}

module.exports = validate
