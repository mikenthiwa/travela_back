import { Op } from 'sequelize';
import models from '../database/models';
import CustomError from '../helpers/Error';
import Validator from './Validator';

export default class RoleValidator {
  static validateUpdateRole(roleNameRequired = true) {
    return async (req, res, next) => {
      req.checkBody('email').isEmail()
        .withMessage('Please provide a valid email');
      if (roleNameRequired) {
        req.checkBody('roleName', 'roleName is required').notEmpty();
      }
      const errors = req.validationErrors();
      Validator.errorHandler(res, errors, next);
    };
  }

  static validateAddRole(req, res, next) {
    Validator.validateUserRoleCheck(req, res, next, 'roleName', 'description');
  }

  // To be changed to allow use of id and not roleName
  static checkUserRole(allowedRoles) {
    return async (req, res, next) => {
      const emailAddress = req.user.UserInfo.email;
      try {
        const query = {
          where: {
            email: emailAddress
          },
          include: [
            {
              model: models.Role,
              as: 'roles',
              attributes: ['id', 'roleName'],
              through: { attributes: [] }
            },
          ]
        };

        const user = await Validator.getUserFromDb(query);
        // Check whether user has any of the allowedRoles
        const hasPermission = user.roles.some(role => allowedRoles
          .includes(role.roleName));
        if (!hasPermission) {
          const error = 'You don\'t have access to perform this action';
          return CustomError.handleError(error, 403, res);
        }
        req.user.roles = user.dataValues.roles;
        req.user.location = user.dataValues.location;
        next();
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'You are not signed in to the application'
        });
      }
    };
  }

  static async roleExists(req, res, next) {
    const { roleName } = req.body;
    const { roleId } = req.params;
    const query = (roleName)
      ? { where: { roleName: { [Op.iLike]: roleName } } }
      : { where: { id: roleId } };
    const foundRole = await models.Role.findOne(query);
    if (!foundRole) {
      const error = 'Role does not exist';
      return CustomError.handleError(error, 404, res);
    }
    req.roleId = foundRole.id;
    req.roleName = foundRole.roleName;
    next();
  }

  static validateRoleAssignment(req, res, next) {
    const isSuperAdmin = req.user.roles
      .some(role => role.roleName === 'Super Administrator');
    if (!isSuperAdmin && req.body.roleName.toLowerCase()
      !== 'travel team member') {
      const error = 'Only a Super Admin can assign that role';
      return CustomError.handleError(error, 403, res);
    }
    next();
  }

  static async checkUserRoleById(userEmail, roleIdsArray, res) {
    try {
      const query = {
        where: { email: userEmail },
        include: [
          {
            model: models.Role,
            as: 'roles',
            attributes: ['id'],
            through: { attributes: [] }
          },
        ]
      };
      const user = await Validator.getUserFromDb(query);
      const hasPermission = user.roles
        .some(role => roleIdsArray.includes(role.id));

      return hasPermission;
    } catch (error) {
      const msg = 'User not found in database';
      return CustomError.handleError(msg, 404, res);
    }
  }

  static async validateChecklistQuery(req, res, next) {
    const { requestId, destinationName } = req.query;

    if (requestId && destinationName) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'You can only have either "requestId" or "destinationName" not both'
      });
    }

    next();
  }

  static async validateRequestIdQuery(req, res, next) {
    const { requestId } = req.query;
    const { id } = req.user.UserInfo;

    try {
      if (requestId) {
        const request = await models.Request
          .findOne({ where: { id: requestId, userId: id } });
        if (!request) {
          return res.status(404).json({
            success: false,
            message: 'Validation failed',
            error: `Request with id '${requestId}' does not exist for this user`
          });
        }
      }

      next();
    } catch (error) { /* istanbul ignore next */
      return CustomError.handleError('Server Error', 404, res);
    }
  }

  static async validateDestinationNameQuery(req, res, next) {
    const { destinationName } = req.query;
    const { email } = req.user.UserInfo;
    if (destinationName) {
      const allowedPermissions = [29187, 10948, 339458, 401938];
      const hasPermission = await RoleValidator
        .checkUserRoleById(email, allowedPermissions, res, next);
      /* istanbul ignore next */
      if (!hasPermission) {
        const error = 'You don\'t have access to perform this action';
        return CustomError.handleError(error, 403, res);
      }
    }
    next();
  }

  static validateUser(req, res, next) {
    Validator.validateUserRoleCheck(req, res, next, 'fullName', 'email', 'picture');
  }

  static validateUserRole(req, res, next) { /* istanbul ignore next */
    Validator.validateUserRoleCheck(req, res, next, 'email', 'roleName');
  }

  static validatePersonalInformation(req, res, next) {
    Validator.validateUserRoleCheck(
      req,
      res,
      next,
      'passportName',
      'gender',
      'department',
      'occupation',
      'manager'
    );
  }
}
