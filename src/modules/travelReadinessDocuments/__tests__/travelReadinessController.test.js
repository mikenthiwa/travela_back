import request from 'supertest';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import NotificationEngine from '../../notifications/NotificationEngine';
import {
  travelAdmin,
  travelAdminPayload,
  usersData,
  travelAdminRole,
  documentsData,
  requesterPayload,
  requester,
  requesterRole
} from './__mocks__';
import TravelReadiness from '../TravelReadinessController';
import otherDocumentsMock from './__mocks__/otherDocumentsMock';

const travelAdminToken = Utils.generateTestToken(travelAdminPayload);
const requesterToken = Utils.generateTestToken(requesterPayload);

const setUp = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.Comment.destroy({ force: true, truncate: { cascade: true } });
  await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
};

describe('TravelReadiness Controller', () => {
  beforeAll(async () => {
    await setUp();
    await models.Role.bulkCreate(role);
    await models.User.create(travelAdmin);
    await models.UserRole.bulkCreate(travelAdminRole);
    await models.User.create(requester);
    await models.UserRole.create(requesterRole);
    await models.User.bulkCreate(usersData);
    await models.TravelReadinessDocuments.bulkCreate(documentsData);
  });

  afterAll(async () => {
    await setUp();
  });

  describe('getAllUsersReadiness', () => {
    it('should require user to be a travel Admin', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/users')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .end((err, res) => {
          expect(res.statusCode).toEqual(403);
          expect(res.body.success).toEqual(false);
          expect(res.body.error).toEqual('You don\'t have access to perform this action');
          if (err) return done(err);
          done();
        });
    });

    it('should get the list of users', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/users')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.users).toBeDefined();
          done();
        });
    });

    it('should filter the list of users', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/users?withDocuments=true')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.users).toBeDefined();
          expect(res.body.users.length).toBe(2);
          done();
        });
    });

    it('should get a paginated list of users', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/users')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          const { pageCount, currentPage } = res.body.meta;
          expect(pageCount).toBe(1);
          expect(currentPage).toBe(1);
          expect(res.status).toBe(200);
          expect(res.body.users).toBeDefined();
          expect(res.body.meta).toBeDefined();
          done();
        });
    });

    it('should get second page from paginated list of users', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/users?page=2')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          const { pageCount, currentPage } = res.body.meta;
          expect(pageCount).toBe(1);
          expect(currentPage).toBe(2);
          expect(res.status).toBe(200);
          expect(res.body.users).toBeDefined();
          expect(res.body.meta).toBeDefined();
          done();
        });
    });

    it('should get the list of users and filter down data when a searchTerm is provided',
      (done) => {
        request(app)
          .get('/api/v1/travelreadiness/users?searchQuery=uchechukwu')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.users).toBeDefined();
            done();
          });
      });

    it("should fetch the list of users from an admin's center", (done) => {
      request(app)
        .get('/api/v1/travelreadiness/users')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.users
            .some(user => user.location !== travelAdmin.location))
            .toEqual(false);
          done();
        });
    });
  });

  describe('getUserReadiness', () => {
    it('a user cannot view another users travel readiness information', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/users/-Flo-RenXiunbs-sIUm')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .end((err, res) => {
          expect(res.statusCode).toEqual(403);
          expect(res.body.success).toEqual(false);
          expect(res.body.error).toEqual('You don\'t have access to perform this action');
          if (err) return done(err);
          done();
        });
    });

    it('should return a 404 error if user does not exist', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/users/-Id-NoT-exiStent')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toEqual('User with id -Id-NoT-exiStent does not exist');
          if (err) return done(err);
          done();
        });
    });

    it('should get a list of the requested users passports and visas', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/users/-FCbaka-ljvhsus83-B')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.user.travelDocuments.passport).toBeDefined();
          expect(res.body.user.travelDocuments.visa).toBeDefined();
          expect(res.body.user.travelDocuments.passport.length).toEqual(1);
          expect(res.body.user.travelDocuments.visa.length).toEqual(1);
          done();
        });
    });
  });

  describe('getTravelReadinessDocument', () => {
    it('a user cannot view another users travel readiness document', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/documents/b9gnYkdzG')
        .set('Content-Type', 'application/json')
        .set('authorization', requesterToken)
        .end((err, res) => {
          expect(res.statusCode).toEqual(403);
          expect(res.body.success).toEqual(false);
          expect(res.body.error).toEqual('You don\'t have access to perform this action');
          if (err) return done(err);
          done();
        });
    });

    it('should return requested document information', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/documents/SyOyr_AtC')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.document).toBeDefined();
          done();
        });
    });

    it('should return a 404 error if document does not exist', (done) => {
      request(app)
        .get('/api/v1/travelreadiness/documents/NulI-D')
        .set('Content-Type', 'application/json')
        .set('authorization', travelAdminToken)
        .end((err, res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toEqual('Document with id NulI-D does not exist');
          done();
        });
    });

    it('should call this function and return undefined', async () => {
      const sendMailToMany = jest.spyOn(NotificationEngine, 'sendMailToMany');
      const { user } = otherDocumentsMock;
      const document = { id: '1234', type: 'visa' };
      const result = await TravelReadiness.sendEditMailNotification(user, document);

      expect(sendMailToMany).toHaveBeenCalled();
      expect(result).toBe(undefined);
    });
  });
});
