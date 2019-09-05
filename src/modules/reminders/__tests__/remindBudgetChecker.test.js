import cron from 'node-cron';
import ReminderEmails from '../reminderEmails';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import BudgetApprovalsController from '../../approvals/BudgetApprovalsController';

describe('test send reminder email to budget checker', () => {
  beforeAll(async () => {
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.Department.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    const mockUser = {
      fullName: 'Test User 1',
      passportName: 'Test User 1',
      department: 'Fellowship-Programs',
      occupation: 'Software developer',
      email: 'test.user1@gmail.com',
      userId: 'test-user-1',
      picture: 'picture.png',
      location: 'National City, Wakanda',
      manager: null,
      gender: 'Male',
      roleId: 401938,
      id: 1
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
      id: 1,
      userId: 1,
      roleId: 401938,
      centerId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const mockRequest = {
      manager: 1,
      name: 'Cate',
      gender: 'Female',
      role: 'Software Developer',
      picture: 'Software Developer',
      tripType: 'oneWay',
      status: 'Approved',
      budgetStatus: 'Open',
      userId: 'test-user-1',
      department: 'Fellowship-Programs',
      id: 'mock-request-id-1',
    };
    await models.Request.create(mockRequest);
    await models.Department.create({
      id: 1, name: 'Fellowship-Programs', createdAt: new Date(), updatedAt: new Date()
    });
    await models.UsersDepartments.create({
      id: 1,
      userId: 1,
      departmentId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  it('test sends notification to budget checker', async (done) => {
    Utils.sendNotificationToBudgetChecker = jest.fn();
    await BudgetApprovalsController.notifyBudgetChecker();
    expect(Utils.sendNotificationToBudgetChecker).toBeCalledTimes(1);
    done();
  });

  it('test sends reminder notification to budget checker', async (done) => {
    Utils.sendNotificationToBudgetChecker = jest.fn();
    await ReminderEmails.remindBudgetChecker();
    expect(Utils.sendNotificationToBudgetChecker).toBeCalledTimes(1);
    done();
  });

  it('test getOpenBudgetStatusRequests function', async (done) => {
    const requests = await ReminderEmails.getOpenBudgetStatusRequests();
    expect(requests.length).toEqual(1);
    done();
  });

  it('tests cron job for sendMailToBudgetChecker function', async (done) => {
    cron.schedule = jest.fn(() => ({
      start: jest.fn()
    }));
    await ReminderEmails.sendMailToBudgetChecker();
    expect(cron.schedule).toBeCalledTimes(1);
    done();
  });
});
