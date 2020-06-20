import Validator from './Validator';

class travelCalendarValidator {
  static validateRequestQuery(req, res, next) {
    req.checkQuery('type', 'type is required').notEmpty();
    req.checkQuery('type', 'type must be json or file').isIn(['json', 'file']);
    req.checkQuery('location', 'location is required').notEmpty();
    req.checkQuery('dateFrom', 'dateFrom is required').notEmpty();
    req.checkQuery('dateTo', 'dateTo is required').notEmpty();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }
}
export default travelCalendarValidator;
