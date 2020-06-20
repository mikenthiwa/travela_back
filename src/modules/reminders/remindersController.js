import { Op, Sequelize } from 'sequelize';
import * as _ from 'lodash';
import models from '../../database/models';
import CustomError from '../../helpers/Error';
import paginationHelper from '../../helpers/Pagination';
import ReminderUtils from './ReminderUtils';

export default class RemindersController {
  static async createReminder(req, res) {
    try {
      const { reminders, ...conditionData } = req.body;
      await models.sequelize.transaction(async () => {
        const condition = await models.Condition.create({
          ...conditionData,
          userId: req.user.UserInfo.id,
        });
        const createdReminders = await models.Reminder.bulkCreate(
          reminders.map(reminder => ({
            ...reminder,
            conditionId: condition.id,
          })),
          { returning: true }
        );
        return res.status(201).json({
          success: true,
          message: 'Reminder successfully created',
          reminder: {
            condition,
            reminders: createdReminders,
          }
        });
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static returnInclude() {
    const include = [{
      model: models.User,
      as: 'user',
      attributes: ['fullName']
    }, {
      model: models.ReminderDisableReason,
      as: 'reasons',
      attributes: ['reason', 'conditionId', 'createdAt']
    }];
    return include;
  }

  static async viewReminders(req, res) {
    try {
      const documentType = req.query.document;
      const documentCount = await models.Condition.findAll({
        group: ['documentType'],
        attributes: ['documentType', [Sequelize.fn('count', 'documentType'), 'count']],
        raw: true
      });
      const include = RemindersController.returnInclude();
      const query = {
        include,
        where: documentType ? {
          documentType: {
            [Op.iLike]: `%${documentType}%`
          }
        } : {},
        order: [['createdAt', 'DESC'],
          [{ model: models.ReminderDisableReason, as: 'reasons' }, 'createdAt', 'DESC']]
      };

      const count = await models.Condition.count(query);
      const initialPage = paginationHelper.initializePagination(req);
      const { page, limit } = initialPage;
      const paginationData = paginationHelper.getPaginationData(page, limit, count);
      const { pageCount, currentPage } = paginationData;
      const reminders = await models.Condition.findAll({ ...query, ...initialPage });
      res.status(200).json({
        success: true,
        message: `Successfully retrieved ${documentType || 'reminder'}s`,
        reminders,
        meta: {
          documentCount: _.mapValues(_.keyBy(documentCount, 'documentType'), 'count'),
          pagination: { pageCount, currentPage }
        }
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async createDisableReason(req, recordKey, record) {
    const Reason = await models.ReminderDisableReason.create({
      reason: req.body.reason.trim(),
      [recordKey]: record.id
    });
    return Reason;
  }

  static async findCondition(req) {
    const { conditionId } = req.params;
    const include = RemindersController.returnInclude();
    const condition = await models.Condition.findOne({
      where: { id: conditionId },
      include,
      order: [[{ model: models.ReminderDisableReason, as: 'reasons' }, 'createdAt', 'DESC']]
    });

    return condition;
  }

  static async disableReminderConditions(req, res) {
    try {
      const condition = await RemindersController.findCondition(req);
      await condition.update({ disabled: true });

      await RemindersController.createDisableReason(
        req, 'conditionId', condition
      );

      const updatedCondition = await RemindersController.findCondition(req);

      return res.status(200).json({
        success: true,
        message: 'Condition has been successfully disabled',
        condition: updatedCondition,
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.stack, 500, res);
    }
  }

  static async enableReminderConditions(req, res) {
    try {
      const { conditionId } = req.params;

      const condition = await models.Condition.findOne({
        where: { id: conditionId },
        include: {
          model: models.User,
          as: 'user',
          attributes: ['fullName']
        }
      });

      await condition.update({
        disabled: false
      });

      return res.status(200).json({
        success: true,
        message: `${condition.conditionName} has been successfully enabled`,
        condition
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }
  
  static async updateMatchOrCreate(reminders, conditionId) {
    const reminderIds = [];
    await Promise.all(
      await reminders.map(async (reminder) => {
        if (reminder.id !== undefined) {
          reminderIds.push(reminder.id);
          const updatedReminder = await models.Reminder.update({
            frequency: reminder.frequency,
            reminderEmailTemplateId: reminder.reminderEmailTemplateId
          }, {
            where: {
              conditionId,
              id: reminder.id,
            },
            returning: true,
          });
          return updatedReminder[1][0];
        }
        const updatedReminder = await models.Reminder.create({
          conditionId,
          frequency: reminder.frequency,
          reminderEmailTemplateId: reminder.reminderEmailTemplateId
        });
        reminderIds.push(updatedReminder.id);

        return updatedReminder;
      })
    );
    return reminderIds;
  }

  static async updateReminder(req, res) {
    const { conditionId } = req.params;
    const { reminders, ...conditionData } = req.body;

    try {
      await models.sequelize.transaction(async () => {
        const reminderCondition = await RemindersController.updateReminderCondition(
          res,
          conditionData,
          conditionId,
        );

        const reminderIds = await RemindersController
          .updateMatchOrCreate(reminders, conditionId);

        models.Reminder.destroy({
          where: {
            id: {
              [Op.notIn]: reminderIds
            },
            conditionId
          }
        });
        const updatedReminder = await models.Reminder.findAll({
          where: { conditionId }
        });
        return ReminderUtils.sendSuccessResponse(res, reminderCondition, updatedReminder);
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }


  static async updateReminderCondition(res, conditionData, conditionId) {
    const reminderCondition = await models.Condition.findById(conditionId);
    
    const { conditionName, documentType } = conditionData;
    await reminderCondition.update({
      conditionName,
      documentType,
      where: { conditionId }
    });
    return reminderCondition;
  }

  static async getSingleReminder(req, res) {
    const { conditionId } = req.params;
    try {
      const reminder = await models.Condition.findOne({
        where: {
          id: conditionId
        },
        include: [
          {
            model: models.Reminder,
            as: 'reminders'
          }
        ]
      });
      res.status(201).json({
        status: true,
        message: 'Reminder found',
        reminder
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }
}
