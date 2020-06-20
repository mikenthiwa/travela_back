import Validator from './Validator';


export default class FlightEstimateValidator {
  static async validateId(req, res, next) {
    req.checkParams('id', 'Flight estimate must be an integer').isInt();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async validateFlightEstimate(req, res, next) {
    req.checkBody('flightEstimate', 'Amount is required and must be a postive number')
      .isInt({ gt: -1 });
    req.checkBody('flightEstimate', 'Flight estimate can not be more than 5000 dollars')
      .isInt({ lt: 5001 });
    req.checkBody('originRegion', 'Origin region must be a string ')
      .trim().notEmpty().optional();
    req.checkBody('destinationRegion', 'Flight destination region must be a string')
      .trim().notEmpty().optional();
    req.checkBody('originCountry', 'Flight origin country must be a string').trim()
      .notEmpty().optional();
    req.checkBody('destinationCountry', 'Flight destination country must be a string')
      .trim().notEmpty().optional();

    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async validateEstimateUpadate(req, res, next) {
    req.checkBody('flightEstimate', 'Amount is required and must be a postive number')
      .isInt({ gt: -1 });
    req.checkBody('flightEstimate', 'Flight estimate can not be more than 5000 dollars')
      .isInt({ lt: 5001 });
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async validateQueryString(req, res, next) {
    req.checkQuery('page', 'page query string must be an integer').isInt({ gt: -1 }).optional();
    req.checkQuery('limit', 'limit query string must be an integer').isInt({ gt: -1 }).optional();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async checkOriginDestination(req, res, next) {
    const {
      body: {
        originCountry,
        originRegion,
        destinationCountry,
        destinationRegion
      }
    } = req;

    const origin = originCountry || originRegion;
    const destination = destinationCountry || destinationRegion;

    if (!(origin && destination) || (origin === destination)) {
      return res.status(400).json({
        success: false,
        message: 'Origin and Destination must be provided and must not be the same'
      });
    }
    return next();
  }
}
