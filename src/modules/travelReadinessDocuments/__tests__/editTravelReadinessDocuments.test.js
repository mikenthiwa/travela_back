import request from 'supertest';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import {
  usersData, requesterPayload, requester, requesterRole, travelAdmin, travelAdminRole
} from './__mocks__';
import {
  documentsSeeder,
  documentUpdateData,
  existingVisaData,
  existingPassportData,
  existingOtherData,
} from './__mocks__/updateTravelDocumentsMockData';

const requesterToken = Utils.generateTestToken(requesterPayload);

const setUp = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
};

describe('TravelReadiness Controller', () => {
  beforeAll(async () => {
    await setUp();
    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(usersData);
    await models.User.create(travelAdmin);
    await models.UserRole.bulkCreate(travelAdminRole);
    await models.User.create(requester);
    await models.UserRole.create(requesterRole);
    await models.TravelReadinessDocuments.bulkCreate(documentsSeeder);
  });

  afterAll(async () => {
    await setUp();
  });

  describe('editTravelReadinessDocument', () => {
    it('should not grant access to an unauthenticated user', (done) => {
      request(app)
        .put('/api/v1/travelreadiness/documents/SyOyr_AtC')
        .set('Content-Type', 'application/json')
        .set('authorization', '')
        .end((err, res) => {
          expect(res.statusCode).toEqual(401);
          expect(res.body.success).toEqual(false);
          expect(res.body.error).toEqual('Please provide a token');
          if (err) return done(err);
          done();
        });
    });

    it('should return an error if document does not exist in the database', (done) => {
      request(app)
        .put('/api/v1/travelreadiness/documents/789y8y89oiu')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Document not found');
          if (err) return done(err);
          done();
        });
    });

    it('should restrict a user from editing another user\'s document', (done) => {
      request(app)
        .put('/api/v1/travelreadiness/documents/b9gnYkdzG')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .end((err, res) => {
          expect(res.statusCode).toEqual(403);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('You don\'t have access to perform this action');
          if (err) return done(err);
          done();
        });
    });

    it(`should throw an error message when a user tries to update 
    unique values already existing in another record (for visas)`, (done) => {
      request(app)
        .put('/api/v1/travelreadiness/documents/SyOyr_BtB')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .send(existingVisaData)
        .end((err, res) => {
          expect(res.statusCode).toEqual(409);
          expect(res.body.success).toEqual(false);
          expect(res.body.errors[0].message)
            .toEqual('You already have a visa for this country with the same expiry date');
          if (err) return done(err);
          done();
        });
    });

    it(`should throw an error message when a user tries to update unique 
    values already existing in another record (for passports)`, (done) => {
      request(app)
        .put('/api/v1/travelreadiness/documents/pk42DLn78u')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .send(existingPassportData)
        .end((err, res) => {
          expect(res.statusCode).toEqual(409);
          expect(res.body.success).toEqual(false);
          expect(res.body.errors[0].message)
            .toEqual('You already have a passport with the same number');
          if (err) return done(err);
          done();
        });
    });

    it(`should throw an error message when a user tries to update unique values 
    already existing in another record (for other documents)`, (done) => {
      request(app)
        .put('/api/v1/travelreadiness/documents/pk42Dr90ops')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .send(existingOtherData)
        .end((err, res) => {
          expect(res.statusCode).toEqual(409);
          expect(res.body.success).toEqual(false);
          expect(res.body.errors[0].message)
            .toEqual('You already have a document with the same name');
          if (err) return done(err);
          done();
        });
    });

    it('should throw an error message when a user tries to update a verified document', (done) => {
      request(app)
        .put('/api/v1/travelreadiness/documents/SyOyr_QbQ')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .send(documentUpdateData)
        .end((err, res) => {
          expect(res.statusCode).toEqual(403);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('You can no longer update this document');
          if (err) return done(err);
          done();
        });
    });

    it('should successfully update the user\'s document when a valid request is made', (done) => {
      request(app)
        .put('/api/v1/travelreadiness/documents/SyOyr_AtC')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .send(documentUpdateData)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('document successfully updated');
          if (err) return done(err);
          done();
        });
    });
  });
});
