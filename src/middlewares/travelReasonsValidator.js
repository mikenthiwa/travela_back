import { Op } from 'sequelize';
import Validator from './Validator';
import models from '../database/models';
import CustomError from '../helpers/Error';
import Utils from '../helpers/Utils';

class TravelReasonsValidator {
  static verifyTravelReasonBody(req, res, next) {
    const { description } = req.body;
    req.checkBody('title').notEmpty().trim()
      .isString()
      .withMessage('Title should be a string')
      .len({ max: 18 })
      .withMessage('Title should not be more than 18 characters');

    req.checkBody('description')
      .len({ max: 140 })
      .withMessage('Description should not be more than 140 characters');

    if (description) {
      req.checkBody('description')
        .isString()
        .withMessage('Description should be a string');
    }

    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async verifyTitle(req, res, next) {
    try {
      const { title } = req.body;
      const { params: { id } } = req;
      const lowerCaseTitle = title.toLowerCase();
      const where = {
        title: lowerCaseTitle,
      };
      if (id) {
        where.id = {
          [Op.ne]: id
        };
      }
      const TravelReason = await models.TravelReason.findOne({ where });
      if (TravelReason) {
        return res.status(422).json({
          success: false,
          message: 'This travel reason already exists',
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('An error occurred', 400, res);
    }
  }

  static async verifyId(req, res, next) {
    try {
      const userId = req.user.UserInfo.id;

      const user = await models.User.findOne({
        where: { userId }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access',
        });
      }
      req.body.user = user;
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('An error occurred', 400, res);
    }
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
      await TravelReasonsValidator.checkField(query, 'page', 'Invalid page number');
      await TravelReasonsValidator.checkField(query, 'limit', 'Invalid limit');
    } catch (error) {
      return res.status(422).json({
        success: false,
        error
      });
    }
    return next();
  }

  static validateTravelReasonId(req, res, next) {
    const { id } = req.params;
    if (!Utils.filterInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'Travel reason id must be a number',
        param: 'id'
      });
    }
    return next();
  }


  static async checkTravelReason(req, res, next) {
    try {
      const { params: { id } } = req;
      const travelReason = await models.TravelReason.findByPk(id, {
        include: [{
          model: models.User,
          as: 'creator',
          attributes: ['fullName', 'userId', 'email']
        }]
      });

      if (!travelReason) {
        return CustomError.handleError('Travel Reason does not exist', 404, res);
      }
      req.travelReason = travelReason;
      return next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError(error.message, 500, res);
    }
  }
}

export default TravelReasonsValidator;
