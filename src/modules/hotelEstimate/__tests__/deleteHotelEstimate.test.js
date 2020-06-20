import supertest from 'supertest';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import TestSetup from './helper';
import mockData from './__mocks__/hotelEstimateMock';

const request = supertest(app);
const url = '/api/v1/hotelEstimate';
const { payload } = mockData;
const token = Utils.generateTestToken(payload);

describe('HotelEstimate', () => {
  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });

  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  it('should throw 422 if id is not an integer', (done) => {
    const expectedResponse = {
      errors: [{ message: 'estimateId should be an integer', name: 'id' }],
      message: 'Validation failed',
      success: false
    };
    request
      .delete(`${url}/ft`)
      .set('authorization', token)
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(422);
        expect(response.body).toEqual(expectedResponse);
        done();
      });
  });
  it('should delete the Hotel Estimate', (done) => {
    const expectedResponse = {
      message: 'Hotel Estimates deleted successfully',
      success: true
    };
    request
      .delete(`${url}/100`)
      .set('authorization', token)
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual(expectedResponse);
        done();
      });
  });
  it('should throw 404 error delete non existant Hotel Estimate', (done) => {
    const expectedResponse = { error: 'Hotel Estimate does not exist', success: false };
    request
      .delete(`${url}/777`)
      .set('authorization', token)
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual(expectedResponse);
        done();
      });
  });
});
