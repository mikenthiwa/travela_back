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
    id: 9099,
    userId: '-kkkfkfkfnninn7',
    fullName: 'Peter Paul',
    name: 'Peter Paul',
    email: 'peter.paul@andela.com',
    picture: 'fake.png'
  }
};

const mockRequest = {
  id: 1,
  userId: '-kkkfkfkfnninn7',
  name: 'Mutungo Heights',
  manager: 'Peter Paul',
  tripType: 'return',
  gender: 'Male',
  department: 'TDD',
  picture: 'picture.png',
  role: 'Software Developer',
  deletedAt: null,
  updatedAt: '2018-09-26T15:47:47.582Z',
  createdAt: '2018-09-26T15:47:47.582Z'
};

const userRoles = [
  {
    id: 1,
    userId: 9099,
    roleId: 53019,
    centerId: 12345,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z'
  },
  {
    id: 2,
    userId: 9099,
    roleId: 60000,
    centerId: 12345,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z'
  },
  {
    id: 3,
    userId: 9099,
    roleId: 70001,
    centerId: 12345,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z'
  }
];

const userMock = {
  id: 9099,
  fullName: 'Peter Paul',
  userId: '-kkkfkfkfnninn7',
  manager: 'Peter Paul',
  location: 'Nairobi, Kenya',
  name: 'Peter Paul',
  email: 'peter.paul@andela.com',
  picture: 'fake.png'
};

const requestData = {
  requestId: 1,
  userId: '-kkkfkfkfnninn7',
  newStatus: 'Approved'
};

const mockApproval = {
  id: 1,
  requestId: 1,
  status: 'Open',
  approverId: 'Peter Paul',
  createdAt: '2018-09-26T15:47:47.582Z',
  updatedAt: '2018-09-26T15:47:47.582Z',
  deletedAt: null
};

const centerMock = {
  id: 12345,
  location: 'Nairobi, Kenya',
  createdAt: '2018-09-26T15:47:47.582Z',
  updatedAt: '2018-09-26T15:47:47.582Z'
};

const token = Utils.generateTestToken(payload);

describe('Budget checker', () => {
  beforeAll(async () => {
    moxios.install();

    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });

    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.Approval.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.sync({ force: true, truncate: { cascade: true } });
    await models.Notification.destroy({
      force: true,
      truncate: { cascade: true }
    });
    await models.User.sync({ force: true, truncate: { cascade: true } });

    process.env.DEFAULT_ADMIN = 'peter.paul@andela.com';
    await models.Center.create(centerMock);
    await models.Role.bulkCreate(role);
    await models.User.create(userMock);
    await models.UserRole.bulkCreate(userRoles);
    await models.Request.create(mockRequest);
    await models.Approval.create(mockApproval);
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
  });

  it('Should send email notification to budget checker', (done) => {
    const sendMailToMany = jest.spyOn(NotificationEngine, 'sendMailToMany');
    request(app)
      .put('/api/v1/approvals/1')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(requestData)
      .end((err, res) => {
        const successMessage = 'Request approved successfully';
        expect(sendMailToMany).toHaveBeenCalled();
        expect(res.body.message).toEqual(successMessage);
        if (err) return done(err);
        done();
      });
  });
  it('should send  notifications to budget checker manager', async (done) => {
    jest.spyOn(ApprovalsController, 'sendEmailTofinanceMembers');
    UserRoleController.getRecipient = jest
      .fn()
      .mockReturnValue({ fullName: 'Peter Paul' }, { userId: null });
    NotificationEngine.notify = jest.fn();
    request(app)
      .put('/api/v1/approvals/budgetStatus/1')
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
