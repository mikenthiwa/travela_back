import { Op } from 'sequelize';
import models from '../database/models';
import Validator from './Validator';

export default class ReminderEmailTemplateValidator {
  static async validateUniqueName(req, res, next) {
    const { body: { name: reminderName } } = req;
    const { params: { templateId } } = req;
    const name = {
      [Op.iLike]: reminderName
    };

    const template = await models.ReminderEmailTemplate
      .findAll({
        where: {
          [templateId ? Op.and : 'name']: (templateId ? {
            id: {
              [Op.ne]: templateId,
            },
            name
          } : name)
        }
      });
    if (template.length === 0) {
      next();
    } else {
      return res.status(409).json({
        success: false,
        error: 'Reminder email template names must be unique'
      });
    }
  }

  static async validateReminderEmailTemplate(req, res, next) {
    req.checkBody('name', 'Email template name is required').notEmpty().trim()
      .len({ min: 4 })
      .withMessage('Email template name should be more than 4 characters');

    req.checkBody('from', 'Sender email address is required').notEmpty().trim()
      .custom(email => Validator.isValidEmail(email))
      .withMessage('Sender email should be a valid Andela email');

    req.checkBody('cc', 'Carbon copy should be a list of emails').isArray();
    req.checkBody('subject', 'Email template subject is required').notEmpty().trim()
      .len({ min: 10 })
      .withMessage('Email subject should be more than 10 characters.');

    req.checkBody('message', 'Email template message is required').notEmpty().trim();

    if (req.validationErrors()) {
      req.getValidationResult().then((result) => {
        const errors = result.array({ onlyFirstError: true });
        Validator.errorHandler(res, errors, next);
      });
    } else {
      next();
    }
  }

  static validateCCEmails(req, res, next) {
    const { body: { cc: emails, from } } = req;
    const errors = emails.filter(
      email => !Validator.isValidEmail(email)
    ).map(email => ({
      msg: `${email} is not a valid Andela email`,
      param: 'cc'
    }
    ));

    if (emails.some(email => email === from)) {
      errors.push({
        msg: 'Sender email should not exist in the cc',
        param: 'cc'
      });
    }

    if (errors.length === 0) {
      next();
    } else {
      Validator.errorHandler(res, errors, next);
    }
  }

  static async validateReqParams(req, res, next) {
    req.check('templateId', 'templateId should be an integer').isInt();
    if (req.validationErrors()) {
      return req.getValidationResult().then((result) => {
        const errors = result.array({ onlyFirstError: true });
        return Validator.errorHandler(res, errors, next);
      });
    }
    next();
  }
}
