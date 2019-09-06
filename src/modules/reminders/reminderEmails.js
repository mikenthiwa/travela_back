import cron from 'node-cron';
import moment from 'moment';
import { Op } from 'sequelize';
import NotificationEngine from '../notifications/NotificationEngine';
import CustomError from '../../helpers/Error';
import models from '../../database/models';
import Utils from '../../helpers/Utils';

export default class ReminderEmails {
  static sendMail() {
    // run cron job everyday at midnight
    const task = cron.schedule('0 0 0 * * *', () => {
      ReminderEmails.executeMailSend();
    });
    task.start();
  }

  static sendMailToBudgetChecker() {
    const task = cron.schedule('0 0 * * *', () => {
      ReminderEmails.remindBudgetChecker();
    });
    task.start();
  }

  static async getOpenBudgetStatusRequests() {
    const openRequests = await models.Request.findAll({
      where: { status: 'Approved', budgetStatus: 'Open' }
    });
    return openRequests;
  }

  static async executeMailSend() {
    try {
      const reminders = await models.Reminder.findAll({
        include: [{
          model: models.Condition,
          as: 'condition',
          where: { disabled: false },
        }, {
          model: models.ReminderEmailTemplate,
          as: 'emailTemplate',
          where: { disabled: false }
        }]
      });

      const userGroup = await Promise.all(reminders.map(async (reminder) => {
        const usergroup = await models.TravelReadinessDocuments.findAll({
          where: {
            type: reminder.condition.documentType.toLowerCase(),
            data: {
              expiryDate: { [Op.eq]: ReminderEmails.dayRange(reminder.frequency) }
            },
          },
          attributes: ['id', 'type', 'userId'],
          include: [{
            model: models.User,
            as: 'user'
          }]
        });
        return usergroup;
      }));
      return await NotificationEngine.sendReminderEmail(userGroup, reminders);
    } catch (error) { /* istanbul ignore next */ CustomError.handleError(error.message, 500); }
  }

  static async remindBudgetChecker() {
    const openRequests = await ReminderEmails.getOpenBudgetStatusRequests();

    openRequests.forEach(async (openRequest) => {
      const messageType = 'Notify budget checker to approve pending requests';
      const messageTopic = 'Reminder for Travel Request Approval';
      const messageNotificationType = 'pending';
      Utils.sendNotificationToBudgetChecker(openRequest.dataValues, messageType,
        messageTopic, messageNotificationType);
    });
  }

  static dayRange(frequency) {
    const today = new Date();
    const [length, period] = frequency.split(' ');
    const resultantExpiryDate = moment(today)
      .add(parseInt(length, 10), period).format('MM/DD/YYYY');
    return resultantExpiryDate.toString();
  }
}
