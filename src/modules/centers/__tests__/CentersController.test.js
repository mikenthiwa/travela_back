import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import centers from './mocks/mockData';

const request = supertest(app);
const payload = {
  UserInfo: {
    id: 'HytrumnBvTrriom',
    name: 'Some Tester',
    email: 'some.tester@andela.com',
    picture: 'fakepicture.png',
  }
};
let createdCenters;
const token = Utils.generateTestToken(payload);
const invalidToken = 'eyJhbGciOiJSUzI1NiIsXVCJ9.eyJVc2VySW5mbyI6eyJpZ';
describe('Centers controller', () => {
  beforeAll(async () => {
    await models.Center.destroy({ truncate: true, cascade: true });
    createdCenters = await models.Center.bulkCreate(centers);
  });
  afterAll(async () => {
    await models.Center.destroy({ truncate: true, cascade: true });
  });
  describe('Unauthenticated user', () => {
    it('should throw 401 error if the user does not provide a token',
      (done) => {
        const expectedResponse = {
          status: 401,
          body: {
            success: false,
            error: 'Please provide a token'
          }
        };
        request.get('/api/v1/centers')
          .end((err, res) => {
            if (err) done(err);
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });
    it("should throw 401 error if the user's provides an invalid token",
      (done) => {
        const expectedResponse = {
          status: 401,
          body: {
            success: false,
            error: 'Token is not valid'
          }
        };
        request
          .get('/api/v1/centers')
          .set('authorization', invalidToken)
          .end((err, res) => {
            if (err) done(err);
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });
  });
  describe('Authenticated User', () => {
    describe('GET api/v1/centers', () => {
      it('retrieves the centers', (done) => {
        const expectedResponse = {
          success: true,
          message: 'Centres retrieved successfully',
          centers: JSON.parse(JSON.stringify(createdCenters))
        };
        request
          .get('/api/v1/centers')
          .set('authorization', token)
          .end((err, response) => {
            if (err) done(err);
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual(expectedResponse);
            expect(response.body.centers).toHaveLength(7);
            done();
          });
      });
    });
  });
});
