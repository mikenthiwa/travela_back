import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import createVisaMock from './__mocks__/createVisaMock';
import Utils from '../../../helpers/Utils';
import NotificationEngine from '../../notifications/NotificationEngine';

import {
  travelAdmin,
  travelAdminPayload,
  travelAdminRole,
  documentTypes,
} from './__mocks__';

const request = supertest;
let documentId;
let documentId2;

const clearDatabase = async () => {
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
  await models.Comment.destroy({ force: true, truncate: { cascade: true } });
  await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Center.destroy({ force: true, truncate: { cascade: true } });
  await models.DocumentTypes.destroy({ force: true, truncate: { cascade: true } });
};

describe('delete visa documents', () => {
  const {
    validVisa,
    validVisa2,
    user,
    payload,
    travelTeamMember,
    travelTeamMemberRole,
    centers
  } = createVisaMock;
  const token = Utils.generateTestToken(payload);
  const travelAdminToken = Utils.generateTestToken(travelAdminPayload);

  beforeAll(async () => {
    await clearDatabase();
    await models.User.create(user);
    await models.Role.bulkCreate(role);
    await models.User.create(travelAdmin);
    await models.UserRole.bulkCreate(travelAdminRole);
    await models.User.create(travelTeamMember);
    await models.Center.bulkCreate(centers);
    await models.UserRole.create(travelTeamMemberRole);
    await models.DocumentTypes.bulkCreate(documentTypes);
  });

  afterAll(async () => {
    await clearDatabase();
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

  it('creates a valid visa document', (done) => {
    testClientCreate().send(validVisa2).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(201);
      documentId2 = res.body.addedDocument.id;
      done();
    });
  });

  describe('deleteTravelreadinessdocument', () => {
    it("should fail to delete another user's document", (done) => {
      request(app)
        .delete(`/api/v1/travelreadiness/documents/${documentId}`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.statusCode).toEqual(401);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('You are Unauthorized to delete this Document');
          if (err) return done(err);
          done();
        });
    });

    it('should successfully delete a selected travel document', (done) => {
      const sendMailSpy = jest.spyOn(NotificationEngine, 'sendMailToMany');
      request(app)
        .delete(`/api/v1/travelreadiness/documents/${documentId}`)
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Document successfully deleted');
          expect(sendMailSpy).toHaveBeenCalled();
          done();
        });
    });

    it('should fail to find an already deleted document', (done) => {
      request(app)
        .delete(`/api/v1/travelreadiness/documents/${documentId}`)
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Document does not exist');
          if (err) return done(err);
          done();
        });
    });

    it('should successfully verify document', (done) => {
      request(app)
        .put(`/api/v1/travelreadiness/documents/${documentId2}/verify`)
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(200);
          expect(res.body.updatedDocument.isVerified).toEqual(true);
          done();
        });
    });

    it('should fail to delete a verified document', (done) => {
      request(app)
        .delete(`/api/v1/travelreadiness/documents/${documentId2}`)
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(403);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Document has already been verified');
          done();
        });
    });
  });
});
