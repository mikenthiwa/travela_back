import supertest from 'supertest';
import moxios from 'moxios';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import { role } from '../../userRole/__tests__/mocks/mockData';
import BudgetApprovalsController from '../BudgetApprovalsController';

global.io = {
  sockets: {
    emit: (event, dataToBeEmitted) => dataToBeEmitted
  }
};

const request = supertest(app);

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

const trips = [
  {
    id: 'XLT9S-3Xef',
    origin: 'Kigali, Rwanda',
    destination: 'San, Fransisco',
    departureDate: '2019-03-02',
    returnDate: '2019-03-03',
    checkStatus: 'Not Checked In',
    checkInDate: null,
    checkOutDate: null,
    accommodationType: 'Not Required',
    lastNotifyDate: null,
    notificationCount: 0,
    travelCompletion: 'false',
    otherTravelReasons: 'adf',
    createdAt: '2019-02-28T19:43:07.937Z',
    updatedAt: '2019-02-28T19:43:07.937Z',
    deletedAt: null,
    travelReasons: null,
    bedId: null,
    requestId: '3mzyo5PeA',
    beds: null
  },
  {
    id: 'XLT9S-3Xet',
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    departureDate: '2019-03-02',
    returnDate: '2019-03-03',
    checkStatus: 'Not Checked In',
    checkInDate: null,
    checkOutDate: null,
    accommodationType: 'Not Required',
    lastNotifyDate: null,
    notificationCount: 0,
    travelCompletion: 'false',
    otherTravelReasons: 'adf',
    createdAt: '2019-02-28T19:43:07.937Z',
    updatedAt: '2019-02-28T19:43:07.937Z',
    deletedAt: null,
    travelReasons: null,
    bedId: null,
    requestId: '3mzyo5PeF',
    beds: null
  },
  {
    id: 'AQ1NKnICCk',
    destination: 'Lagos, Nigeria',
    origin: 'Nairobi, Kenya',
    departureDate: '2019-02-28',
    returnDate: '2019-03-01',
    checkStatus: 'Not Checked In',
    checkInDate: null,
    checkOutDate: null,
    accommodationType: 'Not Required',
    lastNotifyDate: null,
    notificationCount: 0,
    travelCompletion: 'false',
    otherTravelReasons: 'adf',
    createdAt: '2019-02-28T19:36:11.092Z',
    updatedAt: '2019-02-28T19:36:11.092Z',
    deletedAt: null,
    travelReasons: null,
    bedId: null,
    requestId: 'L3G8trcWE-',
    beds: null
  },
  {
    id: 'vmCo1lAe24',
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    departureDate: '2019-03-05',
    returnDate: '2019-03-06',
    checkStatus: 'Not Checked In',
    checkInDate: null,
    checkOutDate: null,
    accommodationType: 'Hotel Booking',
    lastNotifyDate: null,
    notificationCount: 0,
    travelCompletion: 'false',
    otherTravelReasons: 'adfadsf',
    createdAt: '2019-02-28T19:46:04.398Z',
    updatedAt: '2019-02-28T19:46:04.398Z',
    deletedAt: null,
    travelReasons: null,
    bedId: null,
    requestId: 'mAemAujOX',
    beds: null
  },
  {
    id: 'XLT9S-9Xet',
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    departureDate: '2019-03-02',
    returnDate: '2019-03-03',
    checkStatus: 'Not Checked In',
    checkInDate: null,
    checkOutDate: null,
    accommodationType: 'Not Required',
    lastNotifyDate: null,
    notificationCount: 0,
    travelCompletion: 'false',
    otherTravelReasons: 'adf',
    createdAt: '2019-02-28T19:43:07.937Z',
    updatedAt: '2019-02-28T19:43:07.937Z',
    deletedAt: null,
    travelReasons: null,
    bedId: null,
    requestId: '3mzyo5PeQ',
    beds: null
  },
  {
    id: 'XLT9S-9Xed',
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    departureDate: '2019-03-02',
    returnDate: '2019-03-03',
    checkStatus: 'Not Checked In',
    checkInDate: null,
    checkOutDate: null,
    accommodationType: 'Not Required',
    lastNotifyDate: null,
    notificationCount: 0,
    travelCompletion: 'false',
    otherTravelReasons: 'adf',
    createdAt: '2019-02-28T19:43:07.937Z',
    updatedAt: '2019-02-28T19:43:07.937Z',
    deletedAt: null,
    travelReasons: null,
    bedId: null,
    requestId: '3mzyo5PeD',
    beds: null
  },
];

const mockRequest = [
  {
    id: '3mzyo5PeA',
    name: 'Moses Gitau',
    tripType: 'return',
    manager: 1,
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
  },
  {
    id: '3mzyo5PeF',
    name: 'Moses Gitau',
    tripType: 'return',
    manager: 1,
    gender: 'Male',
    department: 'Fellowship-Programs',
    role: 'Technical Team Lead',
    status: 'Approved',
    userId: '-LTI9_PM3tV39gffhUIE',
    picture: 'fake.png',
    budgetStatus: 'Open',
    createdAt: '2019-02-28T19:43:07.929Z',
    updatedAt: '2019-02-28T19:43:16.733Z',
    deletedAt: null,
  },
  {
    id: 'L3G8trcWE-',
    name: 'Moses Gitau',
    tripType: 'return',
    manager: 1,
    gender: 'Male',
    department: 'Fellowship-Programs',
    role: 'Technical Team Lead',
    status: 'Approved',
    userId: '-LTI9_PM3tV39gffhUIE',
    picture: 'fake.png',
    budgetStatus: 'Rejected',
    createdAt: '2019-02-28T19:36:11.085Z',
    updatedAt: '2019-02-28T19:42:40.518Z',
    deletedAt: null,
  },
  {
    id: 'mAemAujOX',
    name: 'Moses Gitau',
    tripType: 'return',
    manager: 1,
    gender: 'Male',
    department: 'Fellowship-Programs',
    picture: 'fake.png',
    role: 'Technical Team Lead',
    status: 'Verified',
    userId: '-LTI9_PM3tV39gffhUIE',
    budgetStatus: 'Approved',
    createdAt: '2019-02-28T19:46:04.386Z',
    updatedAt: '2019-02-28T19:46:04.386Z',
    deletedAt: null,
  },
  {
    id: '3mzyo5PeQ',
    name: 'Moses Gitau',
    tripType: 'return',
    manager: 1,
    gender: 'Male',
    department: 'Fellowship-Programs',
    role: 'Technical Team Lead',
    status: 'Approved',
    userId: '-LTI9_PM3tV39gffhUIE',
    picture: 'fake.png',
    budgetStatus: 'Open',
    createdAt: '2019-02-28T19:43:07.929Z',
    updatedAt: '2019-02-28T19:43:16.733Z',
    deletedAt: null,
  },
  {
    id: '3mzyo5PeD',
    name: 'Moses Gitau',
    tripType: 'return',
    manager: 1,
    gender: 'Male',
    department: 'Fellowship-Programs',
    role: 'Technical Team Lead',
    status: 'Approved',
    userId: '-LTI9_PM3tV39gffhUIE',
    picture: 'fake.png',
    budgetStatus: 'Open',
    createdAt: '2019-02-28T19:43:07.929Z',
    updatedAt: '2019-02-28T19:43:16.733Z',
    deletedAt: null,
  },
];

const userRoles = [{
  id: 1,
  userId: 1,
  roleId: 53019,
  centerId: 12345,
  createdAt: '2018-09-26T15:47:47.582Z',
  updatedAt: '2018-09-26T15:47:47.582Z'
},
{
  id: 2,
  userId: 1,
  roleId: 60000,
  centerId: 12345,
  createdAt: '2018-09-26T15:47:47.582Z',
  updatedAt: '2018-09-26T15:47:47.582Z'
},
{
  id: 3,
  userId: 1,
  roleId: 70001,
  centerId: 12345,
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
  manager: 1,
  gender: 'Male',
  picture: 'fake.png',
  location: 'Nairobi',
  createdAt: '2019-02-28T19:31:07.971Z',
  updatedAt: '2019-02-28T19:35:44.022Z',
};

const mockApproval = [
  {
    id: 1,
    requestId: '3mzyo5PeF',
    status: 'Approved',
    approverId: 1,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z',
    deletedAt: null,
    budgetStatus: 'Open'
  },
  {
    id: 2,
    requestId: 'L3G8trcWE-',
    status: 'Approved',
    approverId: 1,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z',
    deletedAt: null,
    budgetStatus: 'Rejected'
  },
  {
    id: 3,
    requestId: 'mAemAujOX',
    status: 'Verified',
    approverId: 1,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z',
    deletedAt: null,
    budgetStatus: 'Approved'
  },
  {
    id: 4,
    requestId: '3mzyo5PeA',
    status: 'Approved',
    approverId: 1,
    createdAt: '2018-09-26T15:47:47.582Z',
    updatedAt: '2018-09-26T15:47:47.582Z',
    deletedAt: null,
    budgetStatus: 'Open'
  }
];

const centerMock = {
  id: 12345,
  location: 'Nairobi, Kenya',
  createdAt: '2018-09-26T15:47:47.582Z',
  updatedAt: '2018-09-26T15:47:47.582Z'
};

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

describe('Should allow the budget checker to view requests by budget status', () => {
  beforeAll(async () => {
    moxios.install();

    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.Department.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Approval.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Notification.destroy({ force: true, truncate: { cascade: true } });

    process.env.DEFAULT_ADMIN = 'peter.paul@andela.com';
    await models.Center.create(centerMock);
    await models.Role.bulkCreate(role);
    await models.User.create(userMock);
    await models.Department.bulkCreate(DepartmentMock);
    await models.UsersDepartments.bulkCreate(UsersDepartmentsMock);
    await models.UserRole.bulkCreate(userRoles);
    await models.Request.bulkCreate(mockRequest);
    await models.Approval.bulkCreate(mockApproval);
    await models.Trip.bulkCreate(trips);
  });

  afterAll(async () => {
    moxios.uninstall();

    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.Department.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Approval.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Notification.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
  });

  it('Should return a list of requests that have already been approved by the manager', (done) => {
    request
      .get('/api/v1/approvals/budget')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Approvals retrieved successfully');
        done();
      });
  });

  it('Should return a list of approvals that are open', (done) => {
    request
      .get('/api/v1/approvals/budget?page=1&budgetStatus=open')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Approvals retrieved successfully');
        done();
      });
  });

  it('Should return a list of approvals that are past', (done) => {
    request
      .get('/api/v1/approvals/budget?page=1&budgetStatus=past')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Approvals retrieved successfully');
        done();
      });
  });

  it('Should return error if request does not exist', (done) => {
    request
      .put('/api/v1/approvals/budgetStatus/opkopkt')
      .set('authorization', token)
      .send({
        budgetStatus: 'Approved'
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(404);
        expect(res.body.success).toEqual(false);
        done();
      });
  });


  it('Should update request', (done) => {
    request
      .put('/api/v1/approvals/budgetStatus/3mzyo5PeF')
      .set('authorization', token)
      .send({
        budgetStatus: 'Approved'
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        done();
      });
  });

  it('Should fail if request as been approved already', (done) => {
    request
      .put('/api/v1/approvals/budgetStatus/3mzyo5PeF')
      .set('authorization', token)
      .send({
        budgetStatus: 'Approved'
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(400);
        expect(res.body.success).toEqual(false);
        done();
      });
  });
  it('Should return a list of approvals that have been searched', (done) => {
    request
      .get('/api/v1/approvals/budget?search=moses')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Approvals retrieved successfully');
        done();
      });
  });

  it('Should return an approval searched by id', (done) => {
    request
      .get('/api/v1/approvals/budget?&search=3mzyo5PeF')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Approvals retrieved successfully');
        done();
      });
  });

  it('Should return a list of approvals searched in past approvals', (done) => {
    request
      .get('/api/v1/approvals/budget?&budgetStatus=past&search=moses')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Approvals retrieved successfully');
        done();
      });
  });

  it('Should return nothing if request does not exist', (done) => {
    request
      .get('/api/v1/approvals/budget?&search=sammy')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('No records found');
        done();
      });
  });

  it('Should return a list of approvals searched by origin or destination', (done) => {
    request
      .get('/api/v1/approvals/budget?&search=kigali')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Approvals retrieved successfully');
        done();
      });
  });
  it('should return response message', (done) => {
    const res = BudgetApprovalsController.responseMesssage(0);
    expect(res).toEqual('You have no approvals at the moment');
    done();
  });
});
