import models from '../database/models';
import Validator from './Validator';

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
}
export default TravelRegionsValidator;
