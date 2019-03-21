import request from 'supertest';
import moxios from 'moxios';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import { role } from '../../userRole/__tests__/mocks/mockData';
import NotificationEngine from '../../notifications/NotificationEngine';
import UserRoleController from '../../userRole/UserRoleController';
import ApprovalsController from '../ApprovalsController';

global.io = {
  sockets: {
    emit: (event, dataToBeEmitted) => dataToBeEmitted
  }
};

const payload = {
  UserInfo: {
    id: '-LTI9_PM3tV39gffhUIE',
    first_name: 'Moses',
    last_name: 'Gitau',
    firstName: 'Moses',
    lastName: 'Gitau',
    email: 'moses.gitau@andela.com',
    name: 'Moses Gitau',
    picture: 'fake.png',
    location: 'Nairobi, Kenya'
  },
};


const mockRequest = [
  {
    id: '3mzyo5PeA',
    name: 'Moses Gitau',
    tripType: 'return',
    manager: 'Moses Gitau',
    gender: 'Male',
    department: 'Fellowship-Programs',
    role: 'Technical Team Lead',
    status: 'Approved',
    userId: '-LTI9_PM3tV39gffhUIE',
    picture: 'fake.png',
    budgetStatus: 'Approved',
    createdAt: '2019-02-28T19:43:07.929Z',
    updatedAt: '2019-02-28T19:43:16.733Z',
    deletedAt: null,
  }
];

const userRoles = [
  {
    id: 1,
    userId: 1,
    roleId: 53019,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z'
  },
  {
    id: 2,
    userId: 1,
    roleId: 60000,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z'
  },
  {
    id: 3,
    userId: 1,
    roleId: 70001,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z'
  }
];

const userMock = {
  id: 1,
  fullName: 'Moses Gitau',
  email: 'moses.gitau@andela.com',
  userId: '-LTI9_PM3tV39gffhUIE',
  passportName: 'Moses Gitau',
  department: 'Fellowship-Programs',
  occupation: 'Technical Team Lead',
  manager: 'Moses Gitau',
  gender: 'Male',
  picture: 'fake.png',
  location: 'Nairobi',
  createdAt: '2019-02-28T19:31:07.971Z',
  updatedAt: '2019-02-28T19:35:44.022Z',
};

const requestData = {
  requestId: '3mzyo5PeA',
  userId: '-kkkfkfkfnninn7',
  newStatus: 'Approved'
};

const mockApproval = [
  {
    id: 1,
    requestId: '3mzyo5PeA',
    status: 'Open',
    approverId: 'Peter Paul',
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z',
    deletedAt: null,
    budgetStatus: 'Open'
  }
];


const DepartmentMock = [
  {
    id: 1,
    name: 'Success',
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  },
  {
    id: 2,
    name: 'Fellowship-Programs',
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  }
];

const UsersDepartmentsMock = [
  {
    id: 1,
    userId: 1,
    departmentId: 1,
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  },
  {
    id: 1,
    userId: 1,
    departmentId: 2,
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  }
];


const token = Utils.generateTestToken(payload);

describe('Budget checker', () => {
  beforeAll(async () => {
    moxios.install();

    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Department.destroy({ force: true, truncate: { cascade: true } });
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.Approval.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.sync({ force: true, truncate: { cascade: true } });
    await models.Notification.destroy({
      force: true,
      truncate: { cascade: true }
    });
    await models.User.sync({ force: true, truncate: { cascade: true } });

    process.env.DEFAULT_ADMIN = 'peter.paul@andela.com';
    await models.Role.bulkCreate(role);
    await models.User.create(userMock);
    await models.UserRole.bulkCreate(userRoles);
    await models.Request.bulkCreate(mockRequest);
    await models.Approval.bulkCreate(mockApproval);
    await models.Department.bulkCreate(DepartmentMock);
    await models.UsersDepartments.bulkCreate(UsersDepartmentsMock);
  });

  afterAll(async () => {
    moxios.uninstall();

    await models.Approval.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Notification.destroy({
      force: true,
      truncate: { cascade: true }
    });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.Department.destroy({ force: true, truncate: { cascade: true } });
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
  });

  it('Should send email notification to budget checker', (done) => {
    request(app)
      .put('/api/v1/approvals/3mzyo5PeA')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(requestData)
      .end((err, res) => {
        const successMessage = 'Request approved successfully';
        expect(res.body.message).toEqual(successMessage);
        if (err) return done(err);
        done();
      });
  });
  it('should send notifications to budget checker manager', async (done) => {
    jest.spyOn(ApprovalsController, 'sendEmailTofinanceMembers');
    UserRoleController.getRecipient = jest
      .fn()
      .mockReturnValue({ fullName: 'Moses Gitaul' }, { userId: null });
    NotificationEngine.notify = jest.fn();
    request(app)
      .put('/api/v1/approvals/budgetStatus/3mzyo5PeA')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send({ budgetStatus: 'Approved' })
      .end((err) => {
        const [args] = NotificationEngine.notify.mock.calls[
          NotificationEngine.notify.mock.calls.length - 1
        ];
        expect(args.notificationType).toEqual('general');
        if (err) return done(err);
        done();
        expect(
          ApprovalsController.sendEmailTofinanceMembers
        ).toHaveBeenCalled();
      });
  });
});
