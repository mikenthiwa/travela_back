import { Op } from 'sequelize';
import models from '../database/models';
import Validator from './Validator';

export default class HotelEstimateValidator {
  static async validateNewEstimate(req, res, next) {
    const {
      body: { travelRegion, country }
    } = req;
    if (travelRegion === undefined && country === undefined) {
      return res.status(422).json({
        success: false,
        message: 'Please specify a travelRegion or country'
      });
    }
    req.checkBody('estimate', 'amount is required and must be a positive number').isInt({ gt: 0 });
    req.checkBody('estimate', 'amount must not be more than 1000 dollars').isInt({ lt: 1001 });
    req
      .checkBody('travelRegion', 'TravelRegion name cannot be empty')
      .trim()
      .notEmpty()
      .matches(/^(?=.*[a-zA-Z])/)
      .withMessage('TravelRegion name must be a string')
      .optional();
    req
      .checkBody('country', 'Country name cannot be empty')
      .trim()
      .notEmpty()
      .matches(/^(?=.*[a-zA-Z])/)
      .withMessage('Country name must be a string')
      .optional();

    return Validator.errorHandler(res, req.validationErrors(), next);
  }

  static async searchForRegion(res, travelRegion, next) {
    await models.TravelRegions.findOrCreate({
      where: {
        region: {
          [Op.iLike]: travelRegion
        }
      },
      defaults: { description: 'Region description', region: travelRegion }
    });
    const foundRegionEstimate = await models.HotelEstimate.find({
      include: [
        {
          association: 'travelRegions',
          where: {
            region: {
              [Op.iLike]: travelRegion
            }
          }
        }
      ]
    });
    if (foundRegionEstimate) {
      return res.status(409).json({
        success: false,
        message: 'A hotel estimate already exists for this region'
      });
    }
    next();
  }

  static async searchForCountry(res, country, next) {
    await models.Country.findOrCreate({
      where: {
        country: {
          [Op.iLike]: country
        }
      },
      defaults: { regionId: 9999, country }
    });
    const foundCountryEstimate = await models.HotelEstimate.find({
      include: [
        {
          association: 'country',
          where: {
            country: {
              [Op.iLike]: country
            }
          }
        }
      ]
    });
    if (foundCountryEstimate) {
      return res.status(409).json({
        success: false,
        message: 'A hotel estimate already exists for this country'
      });
    }
    next();
  }

  static async checkLocation(req, res, next) {
    const {
      body: { travelRegion, country }
    } = req;

    if (travelRegion) {
      return HotelEstimateValidator.searchForRegion(res, travelRegion, next);
    }
    if (country) {
      return HotelEstimateValidator.searchForCountry(res, country, next);
    }
    /* istanbul ignore next */
    next();
  }
}
