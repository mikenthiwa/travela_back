import models from '../database/models';
import Validator from './Validator';

export default class TravelStipendValidator {
  static async validateNewStipend(req, res, next) {
    req.checkBody('stipend', 'stipend is required and must be a positive number')
      .isInt({ gt: -1 });
    req.checkBody('stipend', 'stipend must not be more than 1000 dollars')
      .isInt({ lt: 1001 });
    req.checkBody('center', 'country is required').notEmpty();
    const errors = req.validationErrors();
    if (errors.length) {
      return Validator.errorHandler(res, errors, next);
    }
    return next();
  }

  static async checkCenter(req, res, next) {
    const { body: { center, stipend }, route: { methods: { put } } } = req;
    const action = put;

    if (center !== 'Default') {
      await models.Country.findOrCreate({
        where: {
          country: center
        },
        defaults: { regionId: 9999 }
      });
    }

    const foundStipend = await models.TravelStipends
      .find(
        {
          where: {
            country: center
          }
        }
      );
    TravelStipendValidator.conditionalValidation(res, foundStipend, action, stipend, next);
  }

  static async conditionalValidation(res, foundStipend, action, stipend, next) {
    if (foundStipend) {
      if (!action) {
        return res.status(409).json({
          success: false,
          message: 'A travel stipend already exists for this country'
        });
      }
      if (action && (foundStipend.dataValues.amount === Number(stipend))) {
        return res.status(409).json({
          success: false,
          message: 'A travel stipend already exists for this country'
        });
      }
    }
    return next();
  }

  static async checkValidationErrors(req, res, next) {
    if (req.validationErrors()) {
      req.getValidationResult().then((result) => {
        const errors = result.array({ onlyFirstError: true });
        return Validator.errorHandler(res, errors, next);
      });
    } else {
      return next();
    }
  }

  static async validateUpdateParams(req, res, next) {
    let id;
    if (req.url.toLowerCase().includes('estimate')) {
      id = 'estimateId';
    } else {
      id = 'stipendId';
    }
    req.checkParams('id')
      .isInt()
      .withMessage(`${id} should be an integer`);

    TravelStipendValidator.checkValidationErrors(req, res, next);
  }

  static async validateTravelStipendsLocations(req, res, next) {
    req.checkQuery('locations', 'one or more locations must be sent').notEmpty();
    TravelStipendValidator.checkValidationErrors(req, res, next);
  }
}
