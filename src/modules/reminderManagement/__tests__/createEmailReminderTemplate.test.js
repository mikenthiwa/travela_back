import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import { role } from '../../userRole/__tests__/mocks/mockData';
import mockData from './__mocks__/mockEmailTemplate';


const request = supertest;
const payload = {
  UserInfo: {
    id: '--MUyHJmKrxA90lPNQ1FOLNm',
    email: 'captan.ameria@andela.com',
    name: 'Samuel Kubai',
  },
};

const nonTravelAdmin = {
  UserInfo: {
    id: '-MUnaemKrxA90lPNQs1FOLNm',
    email: 'captan.egypt@andela.com',
    name: 'Sweetness',
  }
};

const userMock = [
  {
    id: 20000,
    fullName: 'Samuel Kubai',
    email: 'captan.ameria@andela.com',
    userId: '--MUyHJmKrxA90lPNQ1FOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 20001,
    fullName: 'Sweetness',
    email: 'captan.egypt@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];
const userRole = [{ userId: 20000, roleId: 29187 }, {
  userId: 20001,
  roleId: 401938
}];
const token = Utils.generateTestToken(payload);
const nonTravelAdminToken = Utils.generateTestToken(nonTravelAdmin);

const createEmailTemplate = (data, done, expectedResponse,
  bodyField = null, authorizedToken = token) => {
  const call = request(app)
    .post('/api/v1/reminderManagement/emailTemplates');
  if (authorizedToken) {
    call.set('Authorization', authorizedToken);
  }
  call.send(data);
  call.end((err, res) => {
    if (err) done(err);
    if (expectedResponse) {
      expect(res.status).toEqual(expectedResponse.status);
      expect(bodyField ? res.body[bodyField] : res.body)
        .toEqual(bodyField ? expectedResponse[bodyField] : expectedResponse.body);
    }
    done();
  });
};

describe('Reminder Email Template Controller', () => {
  beforeAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.ReminderEmailTemplate.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRole);
  });

  beforeEach(async () => {
    await models.ReminderEmailTemplate.destroy({ force: true, truncate: { cascade: true } });
  });

  afterAll(async () => {
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.ReminderEmailTemplate.destroy({ force: true, truncate: { cascade: true } });
  });

  describe('POST /api/v1/reminderManagement/apiTemplates', () => {
    it('should not create a reminder email template if the user does not provide a token',
      (done) => {
        const expectedResponse = {
          status: 401,
          body: {
            success: false,
            error: 'Please provide a token'
          }
        };
        createEmailTemplate({}, done, expectedResponse, null, null);
      });

    it('should create a reminder email template for travel admins', (done) => {
      createEmailTemplate(mockData.reminderEmailTemplate, done, {
        status: 201,
        message: 'Reminder Email Template created successfully'
      }, 'message');
    });

    it('should not allow non-travel admins to create a reminder email template', (done) => {
      createEmailTemplate(mockData.reminderEmailTemplate, done, {
        status: 403,
        error: 'You don\'t have access to perform this action'
      }, 'error', nonTravelAdminToken);
    });

    it('should not create an email template with a name less than 4 characters', (done) => {
      createEmailTemplate({ ...mockData.reminderEmailTemplate, name: 'abc' }, done, {
        status: 422,
        errors: [
          {
            message: 'Email template name should be more than 4 characters',
            name: 'name'
          }
        ]
      }, 'errors');
    });

    it('should ensure all fields are never empty', (done) => {
      createEmailTemplate({}, done, {
        status: 422,
        body: mockData.emptyFieldsResponse
      });
    });

    it('should ensure the sender email does not exist in the cc field', (done) => {
      createEmailTemplate({
        ...mockData.reminderEmailTemplate,
        from: 'moses.muigai@andela.com'
      }, done, {
        status: 422,
        errors: [
          {
            message: 'Sender email should not exist in the cc',
            name: 'cc'
          }
        ]
      }, 'errors');
    });

    it('should ensure the sender email must be a valid Andela email', (done) => {
      createEmailTemplate({
        ...mockData.reminderEmailTemplate,
        from: 'moses.muigai@gmail.com'
      }, done, {
        status: 422,
        errors: [
          {
            message: 'Sender email should be a valid Andela email',
            name: 'from'
          }
        ]
      }, 'errors');
    });

    it('should ensure the cc field is an array', (done) => {
      createEmailTemplate({
        ...mockData.reminderEmailTemplate, cc: ''
      }, done, {
        status: 422,
        errors: [
          {
            message: 'Carbon copy should be a list of emails',
            name: 'cc'
          }
        ]
      }, 'errors');
    });

    it('should ensure the cc field contains valid Andela emails', (done) => {
      createEmailTemplate({
        ...mockData.reminderEmailTemplate,
        cc: ['moses.gitau@anddela.com', 'gitaumoses4@andela.com']
      }, done, {
        status: 422,
        errors: [
          {
            message: 'moses.gitau@anddela.com is not a valid Andela email',
            name: 'cc'
          }
        ]
      }, 'errors');
    });

    it('should ensure the subject cannot be less than 10 characters', (done) => {
      createEmailTemplate({
        ...mockData.reminderEmailTemplate,
        subject: 'abcd'
      }, done, {
        status: 422,
        errors: [
          {
            message: 'Email subject should be more than 10 characters.',
            name: 'subject'
          }
        ]
      }, 'errors');
    });

    it('should ensure the reminder email templates are unique', async () => {
      await request(app)
        .post('/api/v1/reminderManagement/emailTemplates')
        .set('Authorization', token)
        .send(mockData.reminderEmailTemplate);
      const res = await request(app)
        .post('/api/v1/reminderManagement/emailTemplates')
        .set('Authorization', token)
        .send(mockData.reminderEmailTemplate);
      expect(res.body.error).toEqual('Reminder email template names must be unique');
    });
  });

  describe('PUT /api/v1/reminderManagement/emailTemplates/disable/:templateId', () => {
    it('should disable a created email template successfully', async (done) => {
      const res1 = await request(app)
        .post('/api/v1/reminderManagement/emailTemplates')
        .set('Authorization', token)
        .send(mockData.reminderEmailTemplate);
      const res = await request(app)
        .put(`/api/v1/reminderManagement/emailTemplates/disable/
         ${res1.body.reminderEmailTemplate.id}`)
        .set('Authorization', token)
        .send({ reason: 'I dont like it anymore' });
      expect(res.status).toEqual(200);
      expect(res.body.message).toEqual(`${res.body.updatedTemplate.name} has been successfully disabled`);
      done();
    });
    it('should not disable an email template with an invalid id', async (done) => {
      await request(app)
        .post('/api/v1/reminderManagement/emailTemplates')
        .set('Authorization', token)
        .send(mockData.reminderEmailTemplate);
      const res = await request(app)
        .put(`/api/v1/reminderManagement/emailTemplates/disable/ ${30}`)
        .set('Authorization', token)
        .send({ reason: 'I dont like it anymore' });
      expect(res.status).toEqual(404);
      done();
    });
    it('should not disable an email template without a reason', async (done) => {
      const res1 = await request(app)
        .post('/api/v1/reminderManagement/emailTemplates')
        .set('Authorization', token)
        .send(mockData.reminderEmailTemplate);
      const res = await request(app)
        .put(`/api/v1/reminderManagement/emailTemplates/disable/
        ${res1.body.reminderEmailTemplate.id}`)
        .set('Authorization', token);
      expect(res.body.message).toEqual('Validation failed');
      done();
    });
  });
  describe('PUT /api/v1/reminderManagement/emailTemplates/enable/:templateId', () => {
    it('should enable a created email template successfully', async (done) => {
      const res1 = await request(app)
        .post('/api/v1/reminderManagement/emailTemplates')
        .set('Authorization', token)
        .send(mockData.reminderEmailTemplate);
      const templateId = res1.body.reminderEmailTemplate.id;
      const res = await request(app)
        .put(`/api/v1/reminderManagement/emailTemplates/enable/${templateId}`)
        .set('Authorization', token);
      expect(res.status).toEqual(200);
      expect(res.body.message).toEqual(`${res.body.updatedTemplate.name} email template has been successfully enabled`);
      done();
    });

    it('should not enable a created email template if templateId is not a number', async (done) => {
      await request(app)
        .post('/api/v1/reminderManagement/emailTemplates')
        .set('Authorization', token)
        .send(mockData.reminderEmailTemplate);
      const res = await request(app)
        .put('/api/v1/reminderManagement/emailTemplates/enable/thhy')
        .set('Authorization', token);
      expect(res.status).toEqual(422);
      expect(res.body.message).toEqual('Validation failed');
      done();
    });

    it('should not enable an email template with an invalid id', async (done) => {
      await request(app);
      const res = await request(app)
        .put(`/api/v1/reminderManagement/emailTemplates/enable/${30}`)
        .set('Authorization', token);
      expect(res.status).toEqual(404);
      done();
    });
  });
});
