import supertest from 'supertest';
import app from '../../../app';
import centers from './mocks/mockData';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';

const request = supertest(app);

const userMock = [
  {
    id: 20200,
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];

const userRoles = [{
  userId: 20200,
  roleId: 10948
}];

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    picture: 'fake.png'
  }
};

const superAdminToken = Utils.generateTestToken(payload);

describe('Centers controller', () => {
  beforeAll(async () => {
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ truncate: { cascade: true }, force: true });
    await models.User.destroy({ truncate: { cascade: true }, force: true });
    process.env.DEFAULT_ADMIN = 'black.windows@andela.com';
    await models.Role.bulkCreate(role);
    await models.Center.bulkCreate(centers);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRoles);
  });
  afterAll(async () => {
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  });
  describe('Create Center: POST /api/v1/centers', () => {
    it('should throw 400 error if the user does not provide a new location',
      (done) => {
        const expectedResponse = {
          status: 400,
          body: {
            success: false,
            error: 'Please provide a new location'
          }
        };
        request
          .post('/api/v1/centers')
          .set('authorization', superAdminToken)
          .end((err, res) => {
            if (err) done(err);
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

    it('should throw 400 error if new location is not a string',
      (done) => {
        const expectedResponse = {
          status: 400,
          body: {
            success: false,
            error: 'Please provide a valid location'
          }
        };
        request
          .post('/api/v1/centers')
          .set('authorization', superAdminToken)
          .send({ newLocation: 666 })
          .end((err, res) => {
            if (err) done(err);
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

    it('should throw 409 error if the location already exists',
      (done) => {
        request
          .post('/api/v1/centers')
          .set('authorization', superAdminToken)
          .send({ newLocation: 'Lagos, Nigeria' })
          .expect(409)
          .end((err, res) => {
            if (err) done(err);
            expect(res.body.success).toEqual(false);
            expect(res.body.message).toEqual('This centre already exists');
            done();
          });
      });
    it('should create a new location successfully',
      (done) => {
        request
          .post('/api/v1/centers')
          .set('authorization', superAdminToken)
          .send({ newLocation: 'Cairo, Egypt' })
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.success).toEqual(true);
            expect(res.body.message).toEqual('Successfully created a new centre');
            done();
          });
      });
  });
});
