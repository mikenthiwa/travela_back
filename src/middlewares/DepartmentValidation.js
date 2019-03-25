import _ from 'lodash';

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

  static async validateBudgetCheckerDepartments({
    roleName = 'Budget Checker', departments, req, res, next
  }) {
    if (roleName === 'Budget Checker') {
      if ((departments || []).length < 1 || !(departments instanceof Array)) {
        return res.status(400).json({
          success: false,
          message: 'Department must be an array and cannot be empty'
        });
      }

      // remove duplicate departments
      const departmentsToLower = departments.map(dept => dept.toLowerCase());
      const uniqueDepartments = new Set(departmentsToLower);
      req.body.departments = [...uniqueDepartments].map(dept => _.capitalize(dept));
    }
    next();
  }

  static async validateRoleDepartment(req, res, next) {
    const { roleName, departments } = req.body;
    DepartmentValidation.validateBudgetCheckerDepartments({
      roleName, departments, req, res, next
    });
  }
}

export default DepartmentValidation;
