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
      .put(`${url}/yt`)
      .set('authorization', token)
      .send({
        estimate: '10'
      })
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(422);
        expect(response.body).toEqual(expectedResponse);
        done();
      });
  });
  it('should update the Hotel Estimate with country', (done) => {
    const expectedResponse = 'Hotel estimate updated successfully';
    request
      .put(`${url}/100`)
      .set('authorization', token)
      .send({
        estimate: '10'
      })
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(expectedResponse);
        done();
      });
  });
  it('should update the Hotel Estimate with travel region', (done) => {
    const expectedResponse = 'Hotel estimate updated successfully';
    request
      .put(`${url}/98`)
      .set('authorization', token)
      .send({
        estimate: '20'
      })
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(expectedResponse);
        done();
      });
  });
  it('should throw 404 error update non existant Hotel Estimate', (done) => {
    const expectedResponse = {
      success: false,
      error: 'Hotel Estimate does not exist'
    };
    request
      .put(`${url}/770907`)
      .set('authorization', token)
      .send({
        estimate: '10'
      })
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual(expectedResponse);
        done();
      });
  });
  it('should throw 422 error update empty fields Hotel Estimate', (done) => {
    const expectedResponse = [
      { message: 'amount is required and must be a positive number', name: 'estimate' },
      { message: 'amount must not be more than 1000 dollars', name: 'estimate' }
    ];
    request
      .put(`${url}/100`)
      .set('authorization', token)
      .send({
        estimate: ''
      })
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(422);
        expect(response.body.errors).toEqual(expectedResponse);
        done();
      });
  });
});
