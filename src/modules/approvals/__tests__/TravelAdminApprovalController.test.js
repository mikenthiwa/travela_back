import request from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import travelAdminMock from './mocks/travelAdminMock';
import Utils from '../../../helpers/Utils';

const token = Utils.generateTestToken(travelAdminMock.payload);
const token2 = Utils.generateTestToken(travelAdminMock.payload2);


describe('TravelAdmin Controller', () => {
  beforeAll(async () => {
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(travelAdminMock.role);
    await models.Center.bulkCreate(travelAdminMock.center);
    await models.User.bulkCreate(travelAdminMock.userMock);
    await models.UserRole.bulkCreate(travelAdminMock.userRoles);
    await models.Request.bulkCreate(travelAdminMock.requestMock);
    await models.Trip.bulkCreate(travelAdminMock.trips);
  });
  afterAll(async () => {
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
  });

  it('should return all the request for the travel admin',
    (done) => {
      request(app)
        .get('/api/v1/approvals/travel-admin')
        .set('authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message)
            .toEqual('Approvals retrieved successfully');
          done();
        });
    });

  it('should return all the request for the travel admin when a center query is passed',
    (done) => {
      request(app)
        .get('/api/v1/approvals/travel-admin?center=Kenya')
        .set('authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message)
            .toEqual('Approvals retrieved successfully');
          done();
        });
    });

  it('should return all the request for the travel admin when a search query is passed',
    (done) => {
      request(app)
        .get('/api/v1/approvals/travel-admin?search=tomato')
        .set('authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message)
            .toEqual('Approvals retrieved successfully');
          done();
        });
    });

  it('should return nothing if the admin does not have any request for the center',
    (done) => {
      request(app)
        .get('/api/v1/approvals/travel-admin?center=Ghana')
        .set('authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message)
            .toEqual('You have no approvals at the moment');
          done();
        });
    });

  it('should return nothing if the admin does not have any center',
    (done) => {
      request(app)
        .get('/api/v1/approvals/travel-admin')
        .set('authorization', token2)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message)
            .toEqual('You dont have any center Assigned to you');
          done();
        });
    });
});
