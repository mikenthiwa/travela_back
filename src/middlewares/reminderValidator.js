import Validator from './Validator';
import models from '../database/models';
import checkDuplicates from '../helpers/reminderManagement/checkDuplicate';

class ReminderValidator {
  static validateReminder(req, res, next) {
    req.checkBody('conditionName', 'Condition Name is required').notEmpty().trim()
      .len({ min: 4 })
      .withMessage('Condition name should be more than 4 characters');
    req.checkBody('documentType', 'Document Type is either Passport or Visa').trim()
      .isIn(['Passport', 'Visa']);
    req.checkBody('reminders', 'Reminders should be a list of reminders').isArray().notEmpty();
    req.checkBody('reminders.*.frequency', 'Reminder frequency is required').notEmpty().trim();
    req.checkBody('reminders.*.reminderEmailTemplateId', 'Reminder email template is required')
      .notEmpty().trim().isInt()
      .withMessage('Reminder email template must be a number');

    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async validateReminderTemplates(req, res, next) {
    const { reminders } = req.body;
    const reminderTemplates = await models.ReminderEmailTemplate.findAll({
      attributes: ['id', 'name']
    });

    const validPeriods = [
      'Days', 'Weeks', 'Months', 'Years',
      'Day', 'Week', 'Month', 'Year'
    ];
    const errors = [];

    reminders.forEach((reminder, index) => {
      const reminderExists = reminderTemplates
        .some(template => Number(reminder.reminderEmailTemplateId) === template.id);

      if (!reminderExists) {
        errors.push({
          location: 'body',
          param: `reminders[${index}].reminderEmailTemplateId`,
          msg: 'Reminder email template does not exist',
          value: `${reminder.reminderEmailTemplateId}`
        });
      }

      const [length, period] = reminder.frequency.split(' ');
      const isNumber = /^\d+$/.test(length);
      const isValidPeriod = validPeriods.includes(period);

      if (!isNumber || !isValidPeriod) {
        errors.push({
          location: 'body',
          param: `reminders[${index}].frequency`,
          msg: 'Invalid reminder frequency value',
          value: reminder.frequency
        });
      }
    });
    if (errors.length) return Validator.errorHandler(res, errors, next);
    next();
  }

  static async validateUniqueReminderCondition(req, res, next) {
    const { conditionId } = req.params;
    const { conditionName } = req.body;
    const { Op } = models.Sequelize;
    let where = { conditionName };

    if (req.method === 'PUT' && conditionId) {
      where = {
        conditionName, id: { [Op.ne]: conditionId }
      };
    }

    const existingCondition = await models.Condition.findOne({
      where
    });

    if (existingCondition) {
      const errors = [
        {
          msg: 'Reminder condition name already exists',
          param: 'conditionName'
        }
      ];
      return Validator.errorHandler(res, errors, next);
    }
    next();
  }

  static async checkIfDisabledConditionExists(req, res, next) {
    const { conditionId } = req.params;

    if (!Number.isInteger(Number(req.params.conditionId))) {
      return res.status(422).json({ success: false, message: 'The Condition ID is not an integer' });
    }
    const condition = await models.Condition.findOne({
      where: { id: conditionId, disabled: true }
    });

    if (condition) {
      return next();
    }
    return res.status(404).json({ success: false, message: 'Condition not found' });
  }


  static async checkIfConditionExists(req, res, next) {
    const { conditionId } = req.params;

    if (!Number.isInteger(Number(conditionId))) {
      return res.status(422).json({ success: false, message: 'Condition ID is not an integer' });
    }
    const condition = await models.Condition.findOne({
      where: { id: conditionId, disabled: false }
    });

    if (condition) { return next(); }
    return res.status(404).json({ success: false, message: 'Condition not found' });
  }

  static async validateReason(req, res, next) {
    req.checkBody('reason', 'Reason for disabling is required')
      .notEmpty().trim();
    req.checkBody('reason', 'Reason must contain at least five characters')
      .len({ min: 5 });
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async validateDisability(req, res, next) {
    const emailTemplate = await models.ReminderEmailTemplate.findOne({
      where: { id: parseInt(req.params.templateId, 10) }
    });
    if (!emailTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Reminder doesn\'t exist',
      });
    }

    if (emailTemplate.disabled === true) {
      return res.status(401).json({
        success: false,
        message: 'Email Template is already disabled',
      });
    }
    return next();
  }

  static checkDuplicateId(reminders) {
    const idArrays = [];
    let duplicate = null;
    reminders.forEach((reminderId) => {
      if (idArrays.indexOf(reminderId) !== -1) {
        duplicate = reminderId;
        return;
      }
      idArrays.push(reminderId);
    });
    return duplicate;
  }

  static async getConditionById(req, res, next) {
    const { method, params: { conditionId } } = req;
    if (method === 'GET') {
      req.check('conditionId', 'ConditionId should be a number').isInt();
      const errors = req.validationErrors();
      if (errors.length) {
        return Validator.errorHandler(res, errors, next);
      }
    }
    const condition = await models.Reminder.findOne({
      where: {
        conditionId
      }
    });

    if (condition === null) {
      return res.status(404).json({
        success: false,
        message: 'Reminder doesn\'t exist',
      });
    }
    return method === 'GET' ? next() : false;
  }

  static getDuplicatedId(reminders) {
    const reminderRequestIdArray = reminders
      .filter(reminder => reminder.id !== undefined)
      .map(reminder => reminder.id);
    const duplicateId = ReminderValidator
      .checkDuplicateId(reminderRequestIdArray);
    return {
      reminderRequestIdArray,
      duplicateId
    };
  }

  static async checkReminderWithId(req, res, next) {
    const { reminders } = req.body;
    const { conditionId } = req.params;
    const errors = [];
    const isFound = await ReminderValidator.getConditionById(req, res, next);
    if (isFound) {
      return isFound;
    }
    const { duplicateId, reminderRequestIdArray } = ReminderValidator.getDuplicatedId(reminders);
    if (duplicateId) {
      return Validator.errorHandler(res, [
        {
          msg: `Duplicate id ${duplicateId} in reminders`,
          param: 'Reminder frequency error'
        }
      ], next);
    }

    const allReminders = await models.Reminder.findAll({
      where: {
        conditionId
      }
    });
    const allReminderId = allReminders.map(reminder => reminder.id);
    reminderRequestIdArray.forEach((id) => {
      if (allReminderId.indexOf(id) === -1) {
        const error = {
          msg: `Reminder with id ${id} doesn't belong to this reminder condition`,
          param: 'Reminder condition error'
        };
        errors.push(error);
      }
    });
    if (errors.length) {
      return Validator.errorHandler(res, errors, next);
    }
    next();
  }

  static async checkUniqueFrequency(req, res, next) {
    const { Op } = models.Sequelize;
    const { reminders } = req.body;
    const { conditionId } = req.params;
    const errors = [];
    const checkForDuplicates = checkDuplicates(reminders);
    if (checkForDuplicates) {
      errors.push(
        {
          msg: 'Duplicate frequencies for reminders is not allowed',
          param: 'Reminder Frequency error'
        }
      );
      return Validator.errorHandler(res, errors, next);
    }
    await Promise.all(
      reminders.map(async (reminder) => {
        const { frequency, id } = reminder;
        const where = { conditionId, frequency, };
        if (id) {
          where.id = { [Op.ne]: id };
        }
        const foundReminder = await models.Reminder.findOne({ where });
        if (foundReminder) {
          const error = {
            msg: `${reminder.frequency} frequency already exists for this reminder`,
            param: 'Reminder Frequency error'
          };
          errors.push(error);
        }
      })
    );
    if (errors.length) {
      /* istanbul ignore next */
      return Validator.errorHandler(res, errors, next);
    }
    next();
  }
}
export default ReminderValidator;
