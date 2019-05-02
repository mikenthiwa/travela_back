/* eslint-disable indent */
import { validationResult } from 'express-validator/check';
import { Op } from 'sequelize';
import { urlCheck } from '../helpers/reg';
import models from '../database/models';
import Error from '../helpers/Error';
import RoleValidator from './RoleValidator';
import UserRoleController from '../modules/userRole/UserRoleController';
import TravelAdminApprovalController from '../modules/approvals/TravelAdminApprovalController';

export default class Validator {
  static validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }

  static checkGender(req, res, next) {
    if (req.body.gender !== 'Male' && req.body.gender !== 'Female') {
      return res.status(400).json({
        success: false,
        message: 'Gender can only be Male or Female'
      });
    }
    next();
  }

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

  static validateUserRoleCheck(req, res, next, body, body2, body3, body4, body5) {
    req
      .checkBody(body, `${body} is required`)
      .notEmpty()
      .trim();
    req
      .checkBody(body2, `${body2} is required`)
      .notEmpty()
      .trim();
    req
      .checkBody(body3, `${body3} is required`)
      .notEmpty()
      .trim();
    req
      .checkBody(body4, `${body4} is required`)
      .notEmpty()
      .trim();
    req
      .checkBody(body5, `${body5} is required`)
      .notEmpty()
      .trim();

    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static isValidEmail(email) {
    return email && email.split('@')[1] === 'andela.com';
  }

  static checkEmail(req, res, next) {
    const tokenEmail = req.user.UserInfo.email;
    const bodyEmail = req.body.email;
    if ((bodyEmail && !Validator.isValidEmail(bodyEmail)) || !Validator.isValidEmail(tokenEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Only Andela Email address allowed'
      });
    }
    next();
  }

  static validateStatus(req, res, next) {
    req
      .checkBody('newStatus', 'newStatus must be Approved or Rejected')
      .isIn(['Approved', 'Rejected']);
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static validateBudgetStatus(req, res, next) {
    req
      .checkBody('budgetStatus', 'budgetStatus must be Approved or Rejected')
      .custom(budgetStatus => budgetStatus === 'Approved' || budgetStatus === 'Rejected');
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static validateNotificationStatus(req, res, next) {
    Object.keys(req.body).forEach((key) => {
      req.body[`${key}`] = req.body[`${key}`].toLowerCase();
    });

    req.checkBody('currentStatus', 'currentStatus field is required').notEmpty();
    req.checkBody('newStatus', 'newStatus field is required').notEmpty();
    req.checkBody('notificationType', 'notificationType field is required').notEmpty();

    req.checkBody('currentStatus', 'currentStatus must be "unread"').isIn(['unread']);
    req.checkBody('newStatus', 'newStatus must be "read"').isIn(['read']);
    req
      .checkBody('notificationType', 'notificationType can only be pending or general')
      .isIn(['pending', 'general']);
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static validateComment(req, res, next) {
    req.checkBody('comment', 'Comment is required').notEmpty();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async getUserFromDb(query) {
    const user = await models.User.findOne(query);
    return user;
  }

  /* istanbul ignore next */
  static async checkUserRole(req, res, next) {
    const emailAddress = req.user.UserInfo.email;
    const methodName = req.method;
    const action = { POST: 'create', GET: 'view', PUT: 'update' };
    const checkUrl = urlCheck.test(req.body.imageUrl);
    try {
      const query = { where: { email: emailAddress } };
      const user = await Validator.getUserFromDb(query, res);
      if (user.roleId !== 29187 && user.roleId !== 10948) {
        return res.status(401).json({
          success: false,
          message: `Only a Travel Admin can ${action[methodName]} a Guest House`
        });
      }
      if (action[methodName] === 'create' && !checkUrl) {
        return res.status(400).json({
          success: false,
          message: 'Only Url allowed for Image'
        });
      }
      next();
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }
  }

  static async getUserId(req, res, next) {
    const { id } = req.params;
    const user = await models.User.find({ where: { userId: id } });
    if (!user) {
      return Error.handleError('User not found', 404, res);
    }
    req.user = user;
    next();
  }

  static async centerExists(req, res, next) {
    const { center } = req.body;
    if (center) {
      if ((center || []).length < 1 || !(center instanceof Array)) {
        const error = 'Center must be an array and cannot be empty';
        return Error.handleError(error, 400, res);
      }
      const findCenter = await Promise.all(
        center.map(centerId => models.Center.findAll({
            where: { location: { [Op.iLike]: centerId } },
            attributes: ['id', 'location']
          }))
      );
      const centerId = [].concat(...findCenter);
      const location = centerId.map(value => value.location);
      const notFound = center.filter(notfound => !location.includes(notfound));
      if (centerId.length < center.length) {
        const error = `Center does not exist -> ${notFound}`;
        return Error.handleError(error, 404, res);
      }
      req.centerId = centerId;
      next();
    } else {
      next();
    }
  }

  static checkSignedInUser(req, res, next) {
    if (req.user.UserInfo.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot perform this operation'
      });
    }
    next();
  }

  static checkSignedInUserOrAdmin(req, res, next) {
    if (req.user.UserInfo.id !== req.params.id) {
      return RoleValidator.checkUserRole([
        'Super Administrator',
        'Travel Administrator',
        'Travel Team Member'
      ])(req, res, next);
    }
    next();
  }

  static async validateNewCentre(req, res, next) {
    const { newLocation: location } = req.body;
    if (!location) return Error.handleError('Please provide a new location', 400, res);
    const message = 'Please provide a valid location';
    if (typeof location !== 'string') return Error.handleError(message, 400, res);
    const foundLocation = await models.Center.findOne({
      where: { location: { [Op.iLike]: location } }
    });
    if (foundLocation) {
      return res.status(409).json({
        success: false,
        message: 'This centre already exists'
      });
    }
    return next();
  }

  static async validateTeamMemberLocation(req, res, next) {
    try {
      const { requestId } = req.params;
      const user = await UserRoleController.findUserDetails(req);
      const adminCountries = TravelAdminApprovalController.getAdminCenter(user);
      const trip = await models.Trip.findOne({
        where: { requestId },
        order: [['departureDate', 'ASC']]
      });
      const country = trip.origin.split(',')[1].trim();
      if (!adminCountries.includes(country)) {
        const error = 'You can only verify a request that has the same origin as one of the locations in your location';
        return Error.handleError(error, 403, res);
      }
      return next();
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }
}
