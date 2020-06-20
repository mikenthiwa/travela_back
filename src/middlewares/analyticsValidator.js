import Validator from './Validator';

export default class analyticsValidator {
  static validateFilterAndType(req, res, next) {
    req.checkQuery('filterBy', 'filterBy is required').notEmpty();
    req.checkQuery('filterBy', 'filterBy must be "month"').isIn(['month']);
    req.checkQuery('type', 'type is required').notEmpty();
    req.checkQuery('type', 'type must be "json" or "file"').isIn(['json', 'file']);
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }
}
