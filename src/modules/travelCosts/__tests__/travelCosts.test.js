import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import TestSetup from '../../travelStipend/__tests__/helper';
import mockData from '../../travelStipend/__tests__/__mocks__/travelStipendMock';

const request = supertest;

const URI = '/api/v1/travelStipend';

const { payload, payloadNotAdmin } = mockData;
const requesterToken = Utils.generateTestToken(payloadNotAdmin);
const superAdminToken = Utils.generateTestToken(payload);

describe('GET /travelCosts', () => {
  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });
  beforeEach(async () => {
    await models.TravelStipends.destroy({ force: true, truncate: { cascade: true } });
    const { travelStipend } = mockData;
    await request(app)
      .post(URI)
      .set('AUthorization', superAdminToken)
      .send(travelStipend);
  });
  afterAll(async () => {
    await TestSetup.destoryTables();
  });
  it('should require a valid token', (done) => {
    request(app)
      .get('/api/v1/travelCosts')
      .query(
        {
          origin: 'Lagos',
          destination: 'Nairobi'
        }
      )
      .end((err, res) => {
        expect(res.status).toEqual(401);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Please provide a token');
        done();
      });
  });
  it('should require a location property in query params', (done) => {
    request(app)
      .get('/api/v1/travelCosts')
      .set('Authorization', requesterToken)
      .query(
        {
          origin: 'Lagos',
          destination: 'Nairobi'
        }
      )
      .end((err, res) => {
        expect(res.status).toEqual(422);
        expect(res.body.success).toEqual(false);
        expect(res.body.errors[0].message).toEqual('one or more locations must be sent');
        expect(res.body.errors[0].name).toEqual('locations');
        done();
      });
  });
  it('should get travel costs for specified locations', (done) => {
    const queryParams = 'locations[]=%7B%22origin%22:%22Lagos%22,%22destination%22:%22Nairobi,+Kenya%22%7D';
    request(app)
      .get(
        `/api/v1/travelCosts?${queryParams}`
      )
      .set('Authorization', requesterToken)
      .end((err, res) => {
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Travel Costs retrieved successfully');
        done();
      });
  });
  it('should get travel costs for specified locations and region', async (done) => {
    const queryParams = 'locations[]=%7B%22origin%22:%22Lagos,+Portugal%22,%22destination%22:%22Lagos,+Nigeria%22%7D&locations[]=%7B%22origin%22:%22Lagos,+Nigeria%22,%22destination%22:%22Lagos,+France%22%7D&locations[]=%7B%22origin%22:%22Lagos,+France%22,%22destination%22:%22League+City,+United+States%22%7D';
    const response = await request(app)
      .post('/api/v1/regions')
      .set('authorization', superAdminToken)
      .send({ region: 'Europe', description: 'Europe' });
    await request(app)
      .post(`/api/v1/regions/${response.body.TravelRegions.id}/countries`)
      .set('authorization', superAdminToken)
      .send({ countries: ['France'] });
    await request(app)
      .post('/api/v1/hotelEstimate')
      .set('authorization', superAdminToken)
      .send({
        country: 'Nigeria',
        estimate: 750
      });
    await request(app)
      .post('/api/v1/hotelEstimate')
      .set('authorization', superAdminToken)
      .send({
        travelRegion: 'Europe',
        estimate: 750
      });
    request(app)
      .get(
        `/api/v1/travelCosts?${queryParams}`
      )
      .set('Authorization', requesterToken)
      .end((err, res) => {
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Travel Costs retrieved successfully');
        done();
      });
  });
});
