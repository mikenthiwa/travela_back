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

  static async validateRoleDepartment(req, res, next) {
    const { roleName, departments } = req.body;

    if (roleName === 'Budget Checker') {
      if (!departments) {
        return res.status(400).json({
          success: false,
          message: 'You have to add department in an array when adding a user to a budget checker role'
        });
      }
      
      if (departments.length < 1 || !(departments instanceof Array)) {
        return res.status(400).json({
          success: false,
          message: 'Department must be an array and cannot be empty'
        });
      }
    }
    next();
  }
}

export default DepartmentValidation;
