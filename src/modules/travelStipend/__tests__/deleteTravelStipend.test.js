import supertest from 'supertest';
import app from '../../../app';
import mockData from './__mocks__/travelStipendMock';
import Utils from '../../../helpers/Utils';
import TestSetup from './helper';

const request = supertest(app);
const url = '/api/v1/travelStipend';
const {
  payload, listOfStipends,
  payloadNotAdmin
} = mockData;
const token = Utils.generateTestToken(payload);
const nonAdminToken = Utils.generateTestToken(payloadNotAdmin);

describe('TravelStipends', () => {
  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });

  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  describe('Delete Travel Stipend: DELETE /api/v1/travelStipend/:id', () => {
    it('should throw 500 if id is not an integer',
      (done) => {
        const expectedResponse = {
          success: false,
          error: 'Stipend id should be an integer'
        };
        request
          .delete(`${url}/rt`)
          .set('authorization', token)
          .end((err, response) => {
            if (err)done(err);
            expect(response.statusCode).toEqual(400);
            expect(response.body).toEqual(expectedResponse);
            done();
          });
      });

    it('should throw 404 error if the stipend does not exist',
      (done) => {
        const expectedResponse = {
          success: false,
          error: 'Travel stipend does not exist'
        };
        request
          .delete(`${url}/789000`)
          .set('authorization', token)
          .end((err, res) => {
            if (err) done(err);
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual(expectedResponse);
            done();
          });
      });

    it('should throw 400 if default stipend is to be deleted',
      (done) => {
        const travelStipendId = listOfStipends[0].id;
        const expectedResponse = {
          success: false,
          error: 'Default Stipend should not be deleted'
        };
        request
          .delete(`${url}/${travelStipendId}`)
          .set('authorization', token)
          .end((err, res) => {
            if (err) done(err);
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual(expectedResponse);
            done();
          });
      });

    it('should throw 200 if the stipend is successfully deleted',
      (done) => {
        const travelStipendId = listOfStipends[1].id;
        const expectedResponse = {
          success: true,
          message: 'Travel Stipend deleted successfully'
        };
        request
          .delete(`${url}/${travelStipendId}`)
          .set('authorization', token)
          .end((err, res) => {
            if (err) done(err);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expectedResponse);
            done();
          });
      });

    it('should throw 404 error if stipend is already deleted',
      (done) => {
        const travelStipendId = listOfStipends[1].id;
        const expectedResponse = {
          success: false,
          error: 'Travel stipend does not exist'
        };
        request
          .delete(`${url}/${travelStipendId}`)
          .set('authorization', token)
          .end((err, res) => {
            if (err) done(err);
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual(expectedResponse);
            done();
          });
      });

    it('should throw 403 error if the user is not superadmin', (done) => {
      const travelStipendId = listOfStipends[0].id;
      request
        .delete(`${url}/${travelStipendId}`)
        .set('authorization', nonAdminToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.statusCode).toEqual(403);
          done();
        });
    });
  });
});
