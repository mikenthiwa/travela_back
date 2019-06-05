import mail from 'mailgun-js';
import { role } from '../../userRole/__tests__/mocks/mockData';
import models from '../../../database/models/index';
import NotificationEngine from '../NotificationEngine';
import {
  travelAdmin,
} from '../../travelReadinessDocuments/__tests__/__mocks__/index';


jest.mock('mailgun-js', () => ({
  messages: jest.fn()
}));

mail.messages.mockImplementation(() => ({
  send: jest.fn()
}));

global.io = {
  sockets: {
    emit: jest.fn((event, dataToEmit) => dataToEmit)
  }
};

const setup = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
};

describe('Notification Engine', () => {
  beforeAll(async () => {
    await setup();
    await models.Role.bulkCreate(role);
    await models.User.create(travelAdmin);
  });

  afterAll(async () => {
    await setup();
  });

  it('should check for Invalid data', async (done) => {
    NotificationEngine.notify({
      senderId: '5e3RF6',
      recipientId: '94u7fnjsajY',
      notificationType: 'pending',
      message: 'Approved',
      notificationLink: '/requests/my-approvals/',
      senderName: 'maxwell smith',
      senderImage: '/path/to/image',
    });
    expect(global.io.sockets.emit.mock.calls.length).toBe(0);
    done();
  });

  it('should not run mail-gun send function on test mode', async (done) => {
    const mailFunctionRun = NotificationEngine.dispatchEmail({
      senderId: '5e3RF6',
      recipientId: '94u7fnjsajY',
      notificationType: 'pending',
      message: 'Approved',
      notificationLink: '/requests/my-approvals/',
      senderName: 'maxwell smith',
      senderImage: '/path/to/image',
    });
    expect(mailFunctionRun).toBe(false);
    done();
  });

  it('should prepare email and recipinetVars from for bulk email dispatch', async (done) => {
    const users = [
      {
        email: 'victor@andela.com',
        fullName: 'Victor Ugwueze',
      },
      {
        email: 'emake@andela.com',
        fullName: 'Emeka Ugwueze',
      }
    ];
    const { emails, recipientVars } = NotificationEngine.prepareMultipleRecipients(users);
    expect(emails.length).toBe(2);
    expect(Object.keys(recipientVars).includes('victor@andela.com')).toBe(true);
    done();
  });

  it('should not send emails when there are no recipients', (done) => {
    NotificationEngine.dispatchEmail = jest.fn();
    const users = [[]];
    const data = [
      {
        emailTemplate: {
          name: 'Muhanguzi David',
          subject: 'Subject of the reminder',
          message: 'Please work on the reminder',
          cc: ['johny.bravo@andela.com'],
        }
      }
    ];
    NotificationEngine.sendReminderEmail(users, data);
    expect(NotificationEngine.dispatchEmail).not.toHaveBeenCalled();
    done();
  });

  it('should send emails to the intended recipients', async (done) => {
    NotificationEngine.dispatchEmail = jest.fn();
    const users = [
      [{
        user: {
          email: 'david@andela.com',
          fullName: 'David Muhanguzi',
        }
      }
      ]];
    const data = [
      {
        emailTemplate: {
          name: 'Muhanguzi David',
          subject: 'Subject of the reminder',
          message: 'Please work on the reminder',
          cc: ['johny.bravo@andela.com'],
        }
      }
    ];
    await NotificationEngine.sendReminderEmail(users, data);
    expect(NotificationEngine.dispatchEmail).toBeCalled();
    done();
  });

  it('should throw an error if link has no redirect', (done) => {
    try {
      NotificationEngine.verifyRedirectLink('http://localhost:3000/request');
    } catch (error) {
      expect(error.message).toBe(`Redirect link should match "${process.env.REDIRECT_URL}/redirect/*"`);
      done();
    }
  });

  it('should not throw an error if link has redirect', (done) => {
    expect(() => NotificationEngine.verifyRedirectLink(`${process.env.REDIRECT_URL}/redirect/request`)).not.toThrow();
    done();
  });
});
