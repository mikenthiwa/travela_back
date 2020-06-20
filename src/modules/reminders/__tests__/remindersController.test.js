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
  reminderPayload,
  duplicateFrequencyReminder,
  reminderPayloadTwo,
  reminderPayloadWithoutTemplate,
  reminderPayloadWithInvalidTemplate,
  reminderPayloadWithoutConditionName,
  reminderPayloadWithInvalidDocumentType,
  reminderTemplates,
  reminderPayloadWithInvalidFrequency,
  updateReminderPayloads
} from './__mocks__/mockData';

const travelAdminToken = Utils.generateTestToken(travelAdminPayload);
const requesterToken = Utils.generateTestToken(requesterPayload);

const setup = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.Condition.destroy({ force: true, truncate: { cascade: true } });
  await models.Reminder.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
};

let conditonIdTwo;
let reminderId1;
let reminderId2;

describe('Reminders Controller', () => {
  beforeAll(async () => {
    await setup();
    await models.Role.bulkCreate(role);
    const { userId } = await models.User.create(travelAdmin);
    await models.UserRole.bulkCreate(travelAdminRole);
    await models.User.create(requester);
    await models.UserRole.create(requesterRole);
    await models.User.bulkCreate(usersData);
    await models.ReminderEmailTemplate.bulkCreate(reminderTemplates);
    const { conditionName, documentType } = reminderPayloadTwo.condition;
    const reminderCondition = await models.Condition.create({
      conditionName,
      documentType,
      userId
    });
    conditonIdTwo = reminderCondition.id;
    const reminders = await models.Reminder.bulkCreate(
      reminderPayloadTwo.reminders.map(reminder => ({
        ...reminder,
        conditionId: conditonIdTwo
      }))
    );
    reminderId1 = reminders[0].id;
    reminderId2 = reminders[1].id;
  });

  afterAll(async () => {
    await setup();
  });

  const URI = '/api/v1/reminders';
  let conditonIdOne;


  describe('createReminder', () => {
    it('should require a valid token', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .send(reminderPayload)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          expect(res.body.error).toEqual('Please provide a token');
          done();
        });
    });

    it('should not be accessed by an unauthenticated user', (done) => {
      const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5';
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', invalidToken)
        .send(reminderPayload)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          expect(res.body.error).toEqual('Token is not valid');
          done();
        });
    });

    it('should require user to be an admin', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .send(reminderPayload)
        .end((err, res) => {
          expect(res.status).toEqual(403);
          expect(res.body.success).toEqual(false);
          expect(res.body.error).toEqual('You don\'t have access to perform this action');
          if (err) return done(err);
          done();
        });
    });

    it('should create a new reminder and return a success message', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(reminderPayload)
        .end((err, res) => {
          expect(res.status).toEqual(201);
          expect(res.body.success).toEqual(true);
          conditonIdOne = res.body.reminder.condition.id;
          expect(res.body.reminder).toHaveProperty('condition');
          expect(res.body.reminder).toHaveProperty('reminders');
          done();
        });
    });

    it('should not create a new reminder with an existing reminder condition name', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(reminderPayload)
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.errors).toEqual([{
            message: 'Reminder condition name already exists',
            name: 'conditionName'
          }]);
          done();
        });
    });

    it('should throw an error if assigned email template does not exist', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(reminderPayloadWithInvalidTemplate)
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.success).toEqual(false);
          expect(res.body.errors).toEqual([{
            message: 'Reminder email template does not exist',
            name: 'reminders[0].reminderEmailTemplateId'
          }, {
            message: 'Reminder email template does not exist',
            name: 'reminders[1].reminderEmailTemplateId'
          }]);
          done();
        });
    });

    it('should throw an error if there are duplicated frequencies', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(duplicateFrequencyReminder)
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.errors).toEqual([{
            message: 'Duplicate frequencies for reminders is not allowed',
            name: 'Reminder Frequency error'
          }]);
          done();
        });
    });

    it('should throw an error if email template is not assigned to a reminder item', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(reminderPayloadWithoutTemplate)
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.success).toEqual(false);
          expect(res.body.errors).toEqual([{
            message: 'Reminder email template is required',
            name: 'reminders[0].reminderEmailTemplateId'
          }, {
            message: 'Reminder email template must be a number',
            name: 'reminders[0].reminderEmailTemplateId'
          }]);
          done();
        });
    });

    it('should not allow null value for condition name', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(reminderPayloadWithoutConditionName)
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.success).toEqual(false);
          expect(res.body.errors).toEqual([{
            message: 'Condition Name is required',
            name: 'conditionName'
          }, {
            message: 'Condition name should be more than 4 characters',
            name: 'conditionName'
          }]);
          done();
        });
    });

    it('should not allow invalid document type', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(reminderPayloadWithInvalidDocumentType)
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.success).toEqual(false);
          expect(res.body.errors).toEqual([{
            message: 'Document Type is either Passport or Visa',
            name: 'documentType'
          }]);
          done();
        });
    });

    it('should not allow invalid reminder frequency', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(reminderPayloadWithInvalidFrequency)
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.success).toEqual(false);
          expect(res.body.errors).toEqual([{
            message: 'Invalid reminder frequency value',
            name: 'reminders[1].frequency'
          }]);
          done();
        });
    });
  });

  describe('Update Reminder', () => {
    it('should require a valid token for reminder update', (done) => {
      request(app)
        .put(`${URI}/${conditonIdOne}`)
        .set('Content-Type', 'application/json')
        .send(reminderPayload)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          expect(res.body.error).toEqual('Please provide a token');
          done();
        });
    });

    it('should not update a reminder by an unauthenticated user', (done) => {
      const invalidToken = 'ey.hggndnsknkbchsdbchbsdhzcxbhdhdhddhdhhddhhdhddhdhhdhdhdhdh';
      request(app)
        .put(`${URI}/${conditonIdOne}`)
        .set('Content-Type', 'application/json')
        .set('authorization', invalidToken)
        .send(reminderPayload)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          expect(res.body.error).toEqual('Token is not valid');
          done();
        });
    });

    it('should not update a reminder with an existing reminder condition name', (done) => {
      request(app)
        .put(`${URI}/${conditonIdTwo}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(reminderPayload)
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.errors).toEqual([{
            message: 'Reminder condition name already exists',
            name: 'conditionName'
          }]);
          done();
        });
    });

    it('should update a reminder with valid name and frequency', (done) => {
      request(app)
        .put(`${URI}/${conditonIdTwo}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(updateReminderPayloads.getReminderToUpdateOne(
          reminderId1,
          reminderId2,
          {
            conditionName: 'Visa readiness',
            documentType: 'Passport',
            frequency1: '10 Weeks',
            frequency2: '8 Days',
          }
        ))
        .end((err, res) => {
          const { conditionName } = res.body.reminder.condition;
          expect(res.status).toEqual(201);
          expect(res.body.message).toEqual('Reminder successfully upated');
          expect(conditionName).toEqual('Visa readiness');
          expect(res.body.reminder.reminders.length).toEqual(2);
          done();
        });
    });

    it('should not duplicate a reminder frequency', (done) => {
      request(app)
        .put(`${URI}/${conditonIdTwo}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(updateReminderPayloads.getReminderToUpdateOne(
          reminderId1,
          reminderId2,
          {
            conditionName: 'Passport readiness',
            documentType: 'Passport',
            frequency1: '10 Weeks',
            frequency2: '10 Weeks',
          }
        ))
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.errors).toEqual([{
            message: 'Duplicate frequencies for reminders is not allowed',
            name: 'Reminder Frequency error'
          }]);
          done();
        });
    });

    it('should not update a reminder with invalid reminderId', (done) => {
      request(app)
        .put(`${URI}/${conditonIdTwo}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(updateReminderPayloads.getReminderToUpdateOne(
          100,
          reminderId2,
          {
            conditionName: 'Passport readiness',
            documentType: 'Passport',
            frequency1: '19 Weeks',
            frequency2: '40 Weeks',
          }
        ))
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.errors).toEqual([{
            message: 'Reminder with id 100 doesn\'t belong to this reminder condition',
            name: 'Reminder condition error',
          }]);
          done();
        });
    });


    it('should not update a reminder with duplicated reminderIds', (done) => {
      request(app)
        .put(`${URI}/${conditonIdTwo}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(updateReminderPayloads.getReminderToUpdateOne(
          reminderId2,
          reminderId2,
          {
            conditionName: 'Passport readiness',
            documentType: 'Passport',
            frequency1: '4 Weeks',
            frequency2: '9 Days',
          }
        ))
        .end((err, res) => {
          expect(res.status).toEqual(422);
          expect(res.body.errors).toEqual(
            [
              {
                message: `Duplicate id ${reminderId2} in reminders`,
                name: 'Reminder frequency error'
              }
            ]
          );
          done();
        });
    });

    it('should add a new frequency when updating a reminder', (done) => {
      request(app)
        .put(`${URI}/${conditonIdTwo}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(updateReminderPayloads.addNewFrequency(
          reminderId1,
          reminderId2,
          {
            conditionName: 'Passport readiness',
            documentType: 'Passport',
            frequency1: '4 Weeks',
            frequency2: '9 Days',
          }
        ))
        .end((err, res) => {
          expect(res.status).toEqual(201);
          expect(res.body.message).toEqual('Reminder successfully upated');
          expect(res.body.reminder.reminders.length).toEqual(3);
          done();
        });
    });

    it('should delete a reminder frequency not in the update request', (done) => {
      request(app)
        .put(`${URI}/${conditonIdTwo}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(updateReminderPayloads.singleFrequency(reminderId1))
        .end((err, res) => {
          expect(res.status).toEqual(201);
          expect(res.body.message).toEqual('Reminder successfully upated');
          expect(res.body.reminder.reminders.length).toEqual(1);
          done();
        });
    });

    it('should return not found with a non-existing conditionId is passed', (done) => {
      const conditionId = 100;
      request(app)
        .put(`${URI}/${conditionId}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send(updateReminderPayloads.getReminderToUpdateOne(
          reminderId1,
          reminderId2,
          {
            conditionName: 'Passport readiness',
            documentType: 'Passport',
            frequency1: '4 Weeks',
            frequency2: '9 Days',
          }
        ))
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual('Reminder doesn\'t exist');
          done();
        });
    });
  });

  describe('Fetch Reminder', () => {
    it('should fetch a sigle reminder with condition id', (done) => {
      request(app)
        .get(`${URI}/${conditonIdTwo}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toEqual(201);
          expect(res.body.message).toEqual('Reminder found');
          expect(res.body.reminder.reminders.length).toEqual(1);
          done();
        });
    });

    it('should not fetch reminder with condition id', (done) => {
      request(app)
        .get(`${URI}/${conditonIdTwo}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toEqual(201);
          expect(res.body.message).toEqual('Reminder found');
          expect(res.body.reminder.reminders.length).toEqual(1);
          done();
        });
    });

    it('should not fetch reminder with invalid condition id', (done) => {
      const id = '7yy';
      request(app)
        .get(`${URI}/${id}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          const { errors } = res.body;
          expect(res.status).toEqual(422);
          expect(errors[0].message).toEqual('ConditionId should be a number');
          done();
        });
    });

    it('should create a new reminder with singular dates and return a success message', (done) => {
      request(app)
        .post(URI)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .send({
          ...reminderPayload,
          conditionName: 'This is another condition',
          reminders: [{
            frequency: '1 Week',
            reminderEmailTemplateId: '300'
          },
          {
            frequency: '1 Day',
            reminderEmailTemplateId: '301'
          }
          ]
        })
        .end((err, res) => {
          expect(res.status).toEqual(201);
          expect(res.body.success).toEqual(true);
          expect(res.body.reminder).toHaveProperty('condition');
          expect(res.body.reminder).toHaveProperty('reminders');
          done();
        });
    });
  });
});
