import request from 'supertest';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models/index';
import { role } from '../../userRole/__tests__/mocks/mockData';
import {
  travelAdmin,
  travelAdminPayload,
  usersData,
  travelAdminRole,
  requesterPayload,
  requester,
  requesterRole
} from '../../travelReadinessDocuments/__tests__/__mocks__/index';
import {
  reminderConditions,
  reminders,
  reminderTemplates,
  reasonForDisabling
} from './__mocks__/disableConditionMockData';

const travelAdminToken = Utils.generateTestToken(travelAdminPayload);
const requesterToken = Utils.generateTestToken(requesterPayload);

const setup = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.Condition.destroy({ force: true, truncate: { cascade: true } });
  await models.ReminderEmailTemplate.destroy({ force: true, truncate: { cascade: true } });
  await models.Reminder.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
};

describe('Enable reminder conditions', () => {
  beforeAll(async () => {
    await setup();
    await models.Role.bulkCreate(role);
    await models.User.create(travelAdmin);
    await models.UserRole.bulkCreate(travelAdminRole);
    await models.User.create(requester);
    await models.UserRole.create(requesterRole);
    await models.User.bulkCreate(usersData);
    await models.ReminderEmailTemplate.bulkCreate(reminderTemplates);
    await models.Condition.bulkCreate(reminderConditions);
    await models.Reminder.bulkCreate(reminders);
  });

  afterAll(async () => {
    await setup();
  });

  describe('EnableReminderConditions', () => {
    const URI = '/api/v1/reminders/conditions/enable';

    it('should require a valid token', (done) => {
      request(app)
        .put(`${URI}/400`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          expect(res.status).toEqual(401);
          expect(res.body.error).toEqual('Please provide a token');
          done();
        });
    });

    it('should not be accessed by an unauthenticated user', (done) => {
      const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5';
      request(app)
        .put(`${URI}/400`)
        .set('Content-Type', 'application/json')
        .set('authorization', invalidToken)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          expect(res.body.error).toEqual('Token is not valid');
          done();
        });
    });

    it('should require user to be an admin', (done) => {
      request(app)
        .put(`${URI}/400`)
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .end((err, res) => {
          expect(res.status).toEqual(403);
          expect(res.body.success).toEqual(false);
          expect(res.body.error).toEqual("You don't have access to perform this action");
          if (err) return done(err);
          done();
        });
    });

    it('should throw an error if condition does not exist', (done) => {
      request(app)
        .put(`${URI}/67879`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Condition not found');
          done();
        });
    });

    it('should throw an error if conditionId is not a number', (done) => {
      request(app)
        .put(`${URI}/wordsShouldNotWorkAroundHere`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('The Condition ID is not an integer');
          done();
        });
    });

    it('should successfully disable a reminder condition with a valid request', (done) => {
      request(app)
        .put('/api/v1/reminders/conditions/disable/400')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(reasonForDisabling)
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Condition has been successfully disabled');
          done();
        });
    });

    it('should successfully enable a reminder condition with a valid request', (done) => {
      request(app)
        .put(`${URI}/400`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Travel Readiness reminder for visa has been successfully enabled');
          done();
        });
    });

    it('should throw an error if trying to enable an already enabled reminder condition',
      (done) => {
        request(app)
          .put(`${URI}/400`)
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .end((err, res) => {
            expect(res.status).toEqual(404);
            expect(res.body.success).toEqual(false);
            expect(res.body.message).toEqual('Condition not found');
            done();
          });
      });
  });
});
