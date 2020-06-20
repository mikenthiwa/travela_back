import request from 'supertest';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import {
  travelAdmin,
  travelAdminPayload,
  usersData,
  travelAdminRole,
} from '../../travelReadinessDocuments/__tests__/__mocks__';

const travelAdminToken = Utils.generateTestToken(travelAdminPayload);
const passportReminder = {
  id: 1,
  conditionName: 'Travel passport reminder',
  documentType: 'Passport',
  userId: '-LMIzC-bCc10w7Uqc7-B',
  createdAt: '2019-01-17 09:39:53.708+03',
  updatedAt: '2019-01-17 09:39:53.708+03'
};

const visPassport = {
  id: 2,
  conditionName: 'Travel passport reminder',
  documentType: 'visa',
  userId: '-LMIzC-bCc10w7Uqc7-B',
  createdAt: '2019-01-17 09:39:53.708+03',
  updatedAt: '2019-01-17 09:39:53.708+03'
};


const setup = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.Condition.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
};

describe('Reminders Controller', () => {
  beforeAll(async () => {
    await setup();
    await models.Role.bulkCreate(role);
    await models.User.create(travelAdmin);
    await models.UserRole.bulkCreate(travelAdminRole);
    await models.User.bulkCreate(usersData);
    await models.Condition.create(passportReminder);
    await models.Condition.create(visPassport);
  });

  afterAll(async () => {
    await setup();
  });

  const URI = '/api/v1/reminders';

  it('should fetch created reminders', (done) => {
    request(app)
      .get(URI)
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Successfully retrieved reminders');
        done();
      });
  });

  it('should fetch passport reminders', (done) => {
    request(app)
      .get(`${URI}?document=passport`)
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Successfully retrieved passports');
        done();
      });
  });

  it('should fetch visa reminders', (done) => {
    request(app)
      .get(`${URI}?document=visa`)
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Successfully retrieved visas');
        done();
      });
  });

  it('should fetch reminders in page=1', (done) => {
    request(app)
      .get(`${URI}?document?page=1`)
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Successfully retrieved reminders');
        done();
      });
  });
});
