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

const updateEmailTemplate = (data, id, done, expectations, bodyField = null, authorizedToken = travelAdminToken) => {
  const server = request(app)
    .put(`${URI}/${id}`);
  if (authorizedToken) {
    server.set('Authorization', authorizedToken);
  }
  server.send(data);
  server.end((err, res) => {
    if (err) done(err);
    if (expectations) {
      expect(res.status).toEqual(expectations.status);
      expect(bodyField ? res.body[bodyField] : res.body)
        .toEqual(bodyField ? expectations[bodyField] : expectations.body);
    }
    done();
  });
};

const expectedResponseBody = {
  success: false,
  error: 'Please provide a token'
};

const expectedResponse = {
  status: 401,
  body: expectedResponseBody
};

describe('Update reminder email template', () => {
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

  describe('PUT /reminderManagement/emailTemplates/:templateId', () => {
    it('should require a valid token', (done) => {
      updateEmailTemplate(
        mockData.updatedReminderEmailTemplate,
        templateId,
        done,
        expectedResponse,
        null,
        null
      );
    });

    it('should ensure provided token is valid', (done) => {
      const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5';

      updateEmailTemplate(
        mockData.updatedReminderEmailTemplate,
        templateId,
        done,
        { ...expectedResponse, body: { ...expectedResponseBody, error: 'Token is not valid' } },
        null,
        invalidToken
      );
    });

    it('should ensure user to be a travel admin', (done) => {
      updateEmailTemplate(
        mockData.updatedReminderEmailTemplate,
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
      updateEmailTemplate(
        mockData.updatedReminderEmailTemplate,
        999,
        done,
        {
          status: 404,
          error: 'Email template does not exist!'
        },
        'error',
        travelAdminToken
      );
    });

    it('should not update a disabled email template', async (done) => {
      const response = await request(app)
        .post(URI)
        .set('Authorization', travelAdminToken)
        .send(mockData.disabledReminderEmailTemplate);
      const disabledTemplateId = response.body.reminderEmailTemplate.id;

      updateEmailTemplate(
        mockData.updatedReminderEmailTemplate,
        disabledTemplateId,
        done,
        {
          status: 400,
          error: `${mockData.disabledReminderEmailTemplate.name} has been disabled`
        },
        'error',
        travelAdminToken
      );
    });

    it('should update email template', (done) => {
      request(app)
        .put(`${URI}/${templateId}`)
        .set('Authorization', travelAdminToken)
        .set('Content-Type', 'application/json')
        .send(mockData.updatedReminderEmailTemplate)
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Email template updated successfully');
          if (err) return done(err);
          done();
        });
    });
  });
});
