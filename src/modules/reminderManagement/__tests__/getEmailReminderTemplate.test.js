import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import mockData from './__mocks__/mockEmailTemplate';
import TestSetup from './helper';
import {
  travelAdminPayload,
  requesterPayload
} from '../../travelReadinessDocuments/__tests__/__mocks__/index';

const request = supertest;
const travelAdminToken = Utils.generateTestToken(travelAdminPayload);
const requesterToken = Utils.generateTestToken(requesterPayload);
const URI = '/api/v1/reminderManagement/emailTemplates';

const expectedResponseBody = {
  success: false,
  error: 'Please provide a token'
};

const expectedResponse = {
  status: 401,
  body: expectedResponseBody
};

const getEmailTemplate = (id, done, expected, bodyField = null, authorizedToken = travelAdminToken) => {
  const api = request(app)
    .get(`${URI}/${id}`);
  if (authorizedToken) {
    api.set('Authorization', authorizedToken);
  }
  api.end((err, res) => {
    if (err) done(err);
    if (expected) {
      expect(res.status).toEqual(expected.status);
      expect(bodyField ? res.body[bodyField] : res.body)
        .toEqual(bodyField ? expected[bodyField] : expected.body);
    }
    done();
  });
};

describe('Get a single email template', () => {
  let templateId;

  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });

  beforeEach(async () => {
    await models.ReminderEmailTemplate.destroy({ force: true, truncate: { cascade: true } });
    const response = await request(app)
      .post(URI)
      .set('Authorization', travelAdminToken)
      .send(mockData.reminderEmailTemplate);
    templateId = response.body.reminderEmailTemplate.id;
  });

  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  describe('GET /reminderManagement/emailTemplates/:templateId', () => {
    it('should require a valid token', (done) => {
      getEmailTemplate(
        templateId,
        done,
        expectedResponse,
        null,
        null
      );
    });

    it('should ensure provided token is valid', (done) => {
      const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5';

      getEmailTemplate(
        templateId,
        done,
        { ...expectedResponse, body: { ...expectedResponseBody, error: 'Token is not valid' } },
        null,
        invalidToken
      );
    });

    it('should ensure user to be a travel admin', (done) => {
      getEmailTemplate(
        templateId,
        done,
        {
          status: 403,
          error: 'You don\'t have access to perform this action'
        },
        'error',
        requesterToken
      );
    });

    it('should ensure template exists', (done) => {
      getEmailTemplate(
        999,
        done,
        {
          status: 404,
          message: 'Email template does not exist!'
        },
        'message',
        travelAdminToken
      );
    });

    it('should get a single email template', (done) => {
      request(app)
        .get(`${URI}/${templateId}`)
        .set('Authorization', travelAdminToken)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body.success).toEqual(true);
          expect(res.body.reminderEmailTemplate.name).toEqual('Visa Template');
          if (err) return done(err);
          done();
        });
    });
  });
});
