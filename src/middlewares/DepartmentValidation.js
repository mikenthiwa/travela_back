class DepartmentValidation {
  static errorHandler(res, errors, next) {
    if (errors) {
      const errorObj = errors.map(err => ({
        message: err.msg,
        name: err.param
      }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errorObj
      });
    }
    return next();
  }

  static async validateDepartment(req, res, next) {
    req.checkBody('name', 'name is required').notEmpty();
    const errors = req.validationErrors();
    DepartmentValidation.errorHandler(res, errors, next);
  }
}

export default DepartmentValidation;
