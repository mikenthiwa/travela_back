import models from '../database/models';
import Validator from './Validator';
import CustomError from '../helpers/Error';
import Utils from '../helpers/Utils';

const { TravelRegions } = models;

class TravelRegionsValidator {
  // check if input is empty
  static async inputValidation(req, res, next) {
    req.checkBody('region', 'region is required').trim().notEmpty();
    req.checkBody('description', 'description is required').trim().notEmpty();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  // check if region already exixts
  static async conditionValidation(req, res, next) {
    const { region } = req.body;
    let result;
    try {
      result = await TravelRegions.findOne({ where: { region } });
    } catch (error) {
      /* istanbul ignore next */
      Validator.errorHandler(res, error.message, next);
    }
    if (result) {
      return res.status(409).json({
        success: false,
        message: 'A travel region already exists'
      });
    }
    return next();
  }

  static verifyTravelRegionBody(req, res, next) {
    const { description } = req.body;
    req.checkBody('region').notEmpty().trim()
      .isString()
      .withMessage('Region should be a string')
      .len({ max: 18 })
      .withMessage('Region should not be more than 18 characters');

    req.checkBody('description')
      .len({ max: 140 })
      .len({ min: 5 })
      .withMessage('Description should not be less than 5 characters');

    if (description) {
      req.checkBody('description')
        .isString()
        .withMessage('Description should be a string');
    }

    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static validateTravelRegion(req, res, next) {
    const { region } = req.body;
    if (Utils.filterInt(region)) {
      return res.status(400).json({
        success: false,
        error: 'Travel region must not be a number',
      });
    }
    return next();
  }

  static validateTravelRegionId(req, res, next) {
    const { id } = req.params;
    if (!Utils.filterInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'Travel region id must be a number',
      });
    }
    return next();
  }

  static async checkTravelRegion(req, res, next) {
    try {
      const { params: { id } } = req;
      const travelRegion = await models.TravelRegions.findByPk(id, {
        include: [{
          model: models.Country,
          as: 'countries',
        }]
      });

      if (!travelRegion) {
        return CustomError.handleError('Travel Region does not exist', 404, res);
      }
      req.travelReason = travelRegion;
      return next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError(error.message, 500, res);
    }
  }
}
export default TravelRegionsValidator;
