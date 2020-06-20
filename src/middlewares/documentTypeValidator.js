import Validator from './Validator';

class documentTypeValidator {
  static verifyBody(req, res, next) {
    req.checkBody('name').trim().notEmpty()
      .withMessage('name is a required field')
      .isString()
      .withMessage('name must be a string');
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }
}

export default documentTypeValidator;
