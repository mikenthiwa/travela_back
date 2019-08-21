import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import createVisaMock from './__mocks__/createVisaMock';
import Utils from '../../../helpers/Utils';
import NotificationEngine from '../../notifications/NotificationEngine';
import TravelReadinessUtils from '../TravelReadinessUtils';

import {
  travelAdmin,
  travelAdminPayload,
  travelAdminRole,
  documentTypes,
} from './__mocks__';

const request = supertest;
let documentId;

const prepareDatabase = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
  await models.DocumentTypes.destroy({ force: true, truncate: { cascade: true } });
};

describe('verify visa documents', () => {
  const { validVisa, user, payload } = createVisaMock;
  const token = Utils.generateTestToken(payload);
  const travelAdminToken = Utils.generateTestToken(travelAdminPayload);

  beforeAll(async () => {
    await prepareDatabase();
    await models.User.create(user);
    await models.Role.bulkCreate(role);
    await models.User.create(travelAdmin);
    await models.UserRole.bulkCreate(travelAdminRole);
    await models.DocumentTypes.bulkCreate(documentTypes);
  });

  afterAll(async () => {
    await prepareDatabase();
  });

  const testClientCreate = () => request(app).post('/api/v1/travelreadiness').set('authorization', token);

  it('creates a valid visa document', (done) => {
    testClientCreate().send(validVisa).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(201);
      documentId = res.body.addedDocument.id;
      done();
    });
  });

  it(' should successfully verify document', (done) => {
    const sendMailSpy = jest.spyOn(NotificationEngine, 'sendMail');
    request(app)
      .put(`/api/v1/travelreadiness/documents/${documentId}/verify`)
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.updatedDocument.isVerified).toEqual(true);
        expect(sendMailSpy).toHaveBeenCalled();
        done();
      });
  });

  it(' should fail to verify documents when id does not exist', (done) => {
    request(app)
      .put('/api/v1/travelreadiness/documents/wrongId/verify')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(404);
        expect(res.body.message).toEqual('Document does not exist');
        expect(res.body.success).toEqual(false);
        done();
      });
  });

  it(' should return mail data', (done) => {
    const mailData = TravelReadinessUtils.getMailData(
      { id: 'kht520h' },
      { fullName: 'Black Window', email: 'back.window@andela.com' },
      'verify',
      'verify',
      { UserInfo: { name: 'Black Window' } }
    );
    expect(mailData.recipient.name).toEqual('Black Window');
    expect(mailData.recipient.email).toEqual('back.window@andela.com');
    done();
  });
});
