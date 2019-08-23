import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import Utils from '../../../helpers/Utils';
import * as mockData from './__mocks__/checklistMock';

const request = supertest;

global.io = {
  sockets: {
    emit: (event, dataToBeEmitted) => dataToBeEmitted,
  },
};

const requests = {
  id: 'requestid',
  name: 'user',
  gender: 'male',
  department: 'tdd',
  role: 'manager',
  status: 'Approved',
  userId: 1005,
  tripType: 'oneWay',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01',
  picture: 'dafda',
  stipend: 45,
  budgetStatus: 'Approved',
  manager: 10005,
  tripModification: null
};

const trip = {
  id: 'trip',
  requestId: 'requestid',
  origin: 'Lagos, Nigeria',
  destination: 'Nairobi, Kenya',
  departureDate: '2018-08-16 012:11:52.181+01',
  returnDate: '2018-08-16 012:11:52.181+01',
};

describe('Dynamic checklist submissions', () => {
  const user = {
    id: 10005,
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    userId: '10005',
    picture: 'Picture',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  };
  const payload = {
    UserInfo: {
      id: '10005',
      name: 'Samuel Kubai',
      email: 'black.windows@andela.com',
      userId: 1000
    }
  };

  const userRole = {
    id: 1,
    userId: 10005,
    roleId: 10948,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  };

  const token = Utils.generateTestToken(payload);

  beforeAll(async () => {
    await models.DynamicChecklistSubmissions.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
      
    await models.User.create(user);
    await models.Role.bulkCreate(role);
    await models.UserRole.create(userRole);
    await models.Request.create(requests);
    await models.Trip.create(trip);
  });
  
  afterAll(async () => {
    await models.DynamicChecklistSubmissions.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
  });

  it('should get a new checklist if none are available', (done) => {
    request(app)
      .get('/api/v1/dynamic-checklists/requestid/submissions')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.checklist.checklists.length).toBe(1);
        expect(res.body.checklist.trips.length).toBe(1);
        done();
      });
  });

  it('creates a checklist', (done) => {
    const body = {
      id: 'checklistId',
      trips: [mockData.trip],
      checklists: [{
        id: 1,
        name: 'Nigeria-Kenya',
        config: [
          mockData.scale,
          mockData.radio,
          mockData.dropdown,
          mockData.checkbox,
          mockData.checkbox2,
          mockData.checkbox3,
          mockData.invalidRadio,
        ]
      }]
    };
    request(app)
      .post('/api/v1/dynamic-checklists/requestid/submissions')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.checklist.checklists[0].config.length).toBe(7);
        done();
      });
  });

  it('should get an already created checklist', (done) => {
    request(app)
      .get('/api/v1/dynamic-checklists/requestid/submissions')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.checklist.checklists.length).toBe(1);
        expect(res.body.checklist.trips.length).toBe(1);
        expect(res.body.checklist.checklists[0].config.length).toBe(7);
        done();
      });
  });

  it('creates a checklist with a return trip', (done) => {
    const body = {
      id: 'checklistId',
      trips: [mockData.returnTrip],
      checklists: [{
        id: 1,
        name: 'Nigeria-Kenya',
        config: [
          mockData.scale,
          mockData.radio,
          mockData.dropdown,
          mockData.checkbox,
          mockData.checkbox2,
          mockData.checkbox3,
          mockData.invalidRadio,
        ]
      }]
    };
    request(app)
      .post('/api/v1/dynamic-checklists/requestid/submissions')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.checklist.checklists[0].config.length).toBe(7);
        done();
      });
  });

  it('verifies and submits a checklist ', (done) => {
    const body = {
      isSubmitted: true,
      id: 'checklistId',
      trips: [mockData.trip],
      checklists: [{
        id: 1,
        name: 'Nigeria-Kenya',
        config: [
          mockData.scale,
          mockData.checkbox3
        ]
      }]
    };
    request(app)
      .post('/api/v1/dynamic-checklists/requestid/submissions')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.checklist.checklists[0].config.length).toBe(2);
        expect(res.body.checklist.isSubmitted).toBe(true);
        expect(res.body.checklist.completionCount).toBe(100);
        done();
      });
  });

  it('handles percentage calculation properly (100%)', (done) => {
    const body = {
      id: 'checklistId',
      trips: [mockData.trip],
      checklists: [{
        id: 1,
        name: 'Nigeria-Kenya',
        config: [
          mockData.scale,
          mockData.checkbox3
        ]
      }]
    };
    request(app)
      .post('/api/v1/dynamic-checklists/requestid/submissions')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.checklist.completionCount).toBe(100);
        done();
      });
  });

  it('handles percentage calculation properly (50%)', (done) => {
    const body = {
      id: 'checklistId',
      trips: [mockData.trip],
      checklists: [{
        id: 1,
        name: 'Nigeria-Kenya',
        config: [
          mockData.invalidRadio,
        ]
      }]
    };
    request(app)
      .post('/api/v1/dynamic-checklists/requestid/submissions')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.checklist.completionCount).toBe(50);
        done();
      });
  });

  it('handles percentage calculation properly (0%)', (done) => {
    const body = {
      id: 'checklistId',
      trips: [mockData.invalidTrip],
      checklists: [{
        id: 1,
        name: 'Nigeria-Kenya',
        config: [
          mockData.invalidRadio,
        ]
      }]
    };
    request(app)
      .post('/api/v1/dynamic-checklists/requestid/submissions')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.checklist.completionCount).toBe(0);
        done();
      });
  });
});
