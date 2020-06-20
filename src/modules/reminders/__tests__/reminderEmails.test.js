import cron from 'node-cron';
import moment from 'moment';
import models from '../../../database/models/index';
import NotificationEngine from '../../notifications/NotificationEngine';
import { role } from '../../userRole/__tests__/mocks/mockData';
import ReminderEmails from '../reminderEmails';
import {
  travelAdmin,
  usersData,
  travelAdminRole,
  requester,
  requesterRole,
  documentTypes,
} from '../../travelReadinessDocuments/__tests__/__mocks__/index';
import {
  reminderPayloadTwo,
  reminderTemplates,
  frequency,
  documentsData
} from './__mocks__/mockData';

const setup = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.Condition.destroy({ force: true, truncate: { cascade: true } });
  await models.Reminder.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
  await models.DocumentTypes.destroy({ force: true, truncate: { cascade: true } });
};

let conditonIdTwo;

describe('reminderEmails', () => {
  beforeAll(async () => {
    await setup();
    await models.Role.bulkCreate(role);
    const { userId } = await models.User.create(travelAdmin);
    await models.UserRole.bulkCreate(travelAdminRole);
    await models.User.create(requester);
    await models.UserRole.create(requesterRole);
    await models.User.bulkCreate(usersData);
    await models.DocumentTypes.bulkCreate(documentTypes);
    await models.TravelReadinessDocuments.bulkCreate(documentsData);
    await models.ReminderEmailTemplate.bulkCreate(reminderTemplates);
    const { conditionName, documentType } = reminderPayloadTwo.condition;
    const reminderCondition = await models.Condition.create({
      conditionName,
      documentType,
      userId
    });
    conditonIdTwo = reminderCondition.id;
    await models.Reminder.bulkCreate(
      reminderPayloadTwo.reminders.map(reminder => ({
        ...reminder,
        conditionId: conditonIdTwo
      }))
    );
  });

  afterAll(async () => {
    await setup();
  });
  describe('dayRange', () => {
    it('should calculate resultant date in MM/DD/YYYY format', async (done) => {
      const today = new Date();
      const resultantExpiryDate = moment(today).add(5, 'Days').format('MM/DD/YYYY');
      expect(ReminderEmails.dayRange(frequency)).toEqual(resultantExpiryDate.toString());
      done();
    });
  });

  describe('executeMailSend', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should call dayRange function with the reminder frequency', async (done) => {
      ReminderEmails.dayRange = jest.fn();
      await ReminderEmails.executeMailSend();
      expect(ReminderEmails.dayRange).toBeCalledWith('5 Days');
      done();
    });

    it('should call sendReminderEmail function to send emails to recepients', async (done) => {
      NotificationEngine.sendReminderEmail = jest.fn();
      await ReminderEmails.executeMailSend();
      expect(NotificationEngine.sendReminderEmail).toHaveBeenCalled();
      done();
    });
  });

  describe('sendMail', () => {
    it('should call the executeMailSend method everyday', () => {
      ReminderEmails.executeMailSend = jest.fn();
      class Task {
        constructor(interval, execute) {
          this.interval = interval;
          this.execute = execute;
        }

        start() {
          if (this.interval === '0 0 0 * * *') {
            this.execute();
          }
        }
      }
      cron.schedule = jest.fn((interval, execute) => new Task(interval, execute));
      ReminderEmails.sendMail();
      expect(ReminderEmails.executeMailSend).toHaveBeenCalled();
    });
  });
});
