import _ from 'lodash';
import models from '../database/models';
import Utils from '../helpers/Utils';

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

  static checkField(query, field, error) {
    return new Promise(
      (resolve, reject) => {
        if (query[field] && Number.isNaN(Number(query[field]))) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  }

  static async validateParams(req, res, next) {
    const { query } = req;
    try {
      await DepartmentValidation.checkField(query, 'page', 'Invalid page number');
      await DepartmentValidation.checkField(query, 'limit', 'Invalid limit');
    } catch (error) {
      return res.status(422).json({
        success: false,
        error
      });
    }
    return next();
  }

  static validateDepartmentId(req, res, next) {
    const { id } = req.params;
    if (!Utils.filterInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'Department id must be a number',
        param: 'id'
      });
    }
    return next();
  }

  static async validateDepartmentName(req, res, next) {
    req.checkBody('name', 'name is required').notEmpty();
    const errors = req.validationErrors();
    DepartmentValidation.errorHandler(res, errors, next);
  }

  static async validateIfDepartmentExists(req, res, next) {
    const { name } = req.body;
    const departmentExists = await models.Department.findAll({ where: { name: _.capitalize(name) } });

    if (departmentExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This department already exists'
      });
    }

    next();
  }

  static async validateDepartmentsExistence(req, res, next) {
    const { id } = req.params;
    const existingDepartments = await models.Department.findByPk(id, {
      include: [
        { model: models.User, as: 'creator', attributes: ['email', 'fullName', 'userId'] },
        { model: models.Department, as: 'parentDepartments' }]
    });

    if (existingDepartments === null) {
      return res.status(404).json({
        success: false,
        message: 'This department does not exist'
      });
    }
    req.body.departmentToDelete = existingDepartments;
    next();
  }

  static async validateParentDepartmentName(req, res, next) {
    const { parentDepartment } = req.body;
    let existingParentDepartment;
    if (parentDepartment) {
      existingParentDepartment = await models.Department.findOrCreate({
        where: { name: _.capitalize(parentDepartment) },
        defaults: { name: _.capitalize(parentDepartment), createdBy: req.user.UserInfo.id }
      });
    }

    if (existingParentDepartment) {
      req.body.createdParentDepartment = existingParentDepartment[0].dataValues;
    }

    next();
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
    return DepartmentValidation.validateBudgetCheckerDepartments({
      roleName, departments, req, res, next
    });
  }
}

export default DepartmentValidation;
