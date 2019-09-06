import models from '../../database/models';
import Utils from '../Utils';
import NotificationEngine from '../../modules/notifications/NotificationEngine';

describe('test email to budget checker', () => {
  let request;
  beforeAll(async () => {
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Subscription.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.Department.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    const mockUser = {
      fullName: 'Test User 2',
      passportName: 'Test User 2',
      department: 'Fellowship-Programs',
      occupation: 'Software developer',
      email: 'test.user2@gmail.com',
      userId: 'test-user-2',
      picture: 'picture.png',
      location: 'National City, Wakanda',
      manager: null,
      gender: 'Male',
      roleId: 401938,
      id: 2
    };
    await models.Role.create({
      id: 401938,
      roleName: 'Budget Checker',
      description: 'Fellowship-Programs',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await models.User.create(mockUser);
    await models.UserRole.create({
      id: 2,
      userId: 2,
      roleId: 401938,
      centerId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const mockRequest = {
      manager: 2,
      name: 'Catechep',
      gender: 'Female',
      role: 'Software Developer',
      picture: 'Software Developer',
      tripType: 'oneWay',
      status: 'Approved',
      budgetStatus: 'Open',
      userId: 'test-user-2',
      department: 'Fellowship-Programs',
      id: 'mock-request-id-2',
    };
    request = await models.Request.create(mockRequest);
    await models.Department.create({
      id: 2, name: 'Fellowship-Programs', createdAt: new Date(), updatedAt: new Date()
    });
    await models.UsersDepartments.create({
      id: 2,
      userId: 2,
      departmentId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await models.Subscription.create({
      id: 1,
      userId: 'test-user-2',
      p256dh: 'BCAKqfPeev9Q4W7kC1Zak2UwCGuCvJ2wkSxDN-Zx5obazTiLH-P8prcYIZMnMd8P8EzDssI1ejeh7Qt3a3Tcuyt',
      auth: '-_M6xdln15CP7MZp3kQ2_Q',
      endpoint: 'https://fcm.googleapis.com/fcm/send/e4mM6_Kz6vU:APA91bEWRCug0ExaDvhwvhtaDejn9timKAollDdDh6WH8HWn2ff9TUui4KGPnHlHuuwXkoiRTYMpGeyjUrZ77VpbWhDfXuM2AtEjCpXVD-l8ofkM8g-ctsIaTsdF4-eDn70Y9QLTXIhd',
      createdAt: new Date(),
    });
  });
  it('test sends notification to budget checker', async (done) => {
    const messageType = 'Notify budget checker';
    const messageTopic = 'Travel Request Approval';
    const messageNotificationType = 'general';
    NotificationEngine.notify = jest.fn();
    NotificationEngine.sendMailToMany = jest.fn();
    jest.mock('web-push', () => ({
      sendNotification: jest.fn()
    }));
    await Utils.sendNotificationToBudgetChecker(request.dataValues, messageType, messageTopic, messageNotificationType);
    expect(NotificationEngine.notify).toBeCalledTimes(1);
    done();
  });
});
