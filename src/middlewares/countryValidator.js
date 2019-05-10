import models from '../database/models';
import Validator from './Validator';

const { Country, TravelRegions } = models;
class CountryValidator {
  static async regionExistsValidation(req, res, next) {
    let region;
    try {
      region = await TravelRegions.findOne({
        where: {
          id: req.params.regionId
        }
      });
    } catch (error) {
      Validator.errorHandler(res, error.message, next);
    }
    if (!region) {
      return res.status(404).send({
        success: false,
        message: 'The region does not exist'
      });
    }
    next();
  }

  static async inputValidation(req, res, next) {
    req
      .checkBody('countries', 'Country field is required')
      .trim()
      .notEmpty();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async countryExistsValidation(req, res, next) {
    const { countries } = req.body;
    await Promise.all(
      countries.map(async (country) => {
        const exists = await Country.find({
          where: {
            country
          },
          include: [
            {
              model: TravelRegions,
              as: 'region'
            }
          ]
        });
        if (exists) {
          req.checkBody('countries').custom(() => (!exists))
            .withMessage(`${exists.country} has already been added to ${exists.region.region}`);
        }
      })
    );
    Validator.errorHandler(res, req.validationErrors(), next);
  }
}
export default CountryValidator;
