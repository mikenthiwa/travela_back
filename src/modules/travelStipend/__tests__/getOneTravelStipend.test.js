import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import TestSetup from './helper';
import mockData from './__mocks__/travelStipendMock';

const request = supertest;

const URI = '/api/v1/travelStipend';

const expectedResponseBody = {
  success: false,
  error: 'Please provide a token'
};

const expectedResponse = {
  status: 401,
  body: expectedResponseBody
};

const { payload, payloadNotAdmin } = mockData;
const superAdminToken = Utils.generateTestToken(payload);
const requesterToken = Utils.generateTestToken(payloadNotAdmin);


const getOneTravelStipend = (id, done, expected, bodyField = null, token = superAdminToken) => {
  const api = request(app)
    .get(`${URI}/${id}`);
  if (token) {
    api.set('Authorization', token);
  }
  api.end((err, res) => {
    if (err) done(err);
    if (expected) {
      expect(res.status).toEqual(expected.status);
      expect(bodyField ? res.body[bodyField] : res.body)
        .toEqual(bodyField ? expected[bodyField] : expected.body);
    }
    done();
  });
};

describe('Fetch One Travel Stipend', () => {
  let stipendId;

  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });

  beforeEach(async () => {
    await models.TravelStipends.destroy({ force: true, truncate: { cascade: true } });

    const { travelStipend } = mockData;
    const response = await request(app)
      .post(URI)
      .set('AUthorization', superAdminToken)
      .send(travelStipend);
    stipendId = response.body.stipend.id;
  });

  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  describe('GET /travelStipend/:id', () => {
    it('should require a valid token', (done) => {
      getOneTravelStipend(
        stipendId,
        done,
        expectedResponse,
        null,
        null
      );
    });

    it('should ensure provided token is valid', (done) => {
      const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5';


      getOneTravelStipend(
        stipendId,
        done,
        {
          status: 401,
          body: {
            ...expectedResponseBody,
            error: 'Token is not valid'
          }
        },
        null,
        invalidToken
      );
    });

    it('should ensure user is super admin', (done) => {
      getOneTravelStipend(
        stipendId,
        done,
        {
          status: 403,
          error: 'You don\'t have access to perform this action'
        },
        'error',
        requesterToken
      );
    });

    it('should ensure travelStipend exists', (done) => {
      getOneTravelStipend(
        999,
        done,
        {
          status: 404,
          error: 'Travel stipend does not exist'
        },
        'error',
        superAdminToken
      );
    });

    it('should fetch one travelStipend', (done) => {
      request(app)
        .get(`${URI}/${stipendId}`)
        .set('Authorization', superAdminToken)
        .end((err, res) => {
          if (err) return done();
          expect(res.status).toEqual(200);
          expect(res.body.success).toEqual(true);
          expect(res.body.travelStipend.id).toEqual(stipendId);
          done();
        });
    });
  });
});


describe('GET /travelStipends/location', () => {
  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });

  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  it('should require a valid token', (done) => {
    request(app)
      .get('/api/v1/travelStipends/location')
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
      .get('/api/v1/travelStipends/location')
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
  it('should get stipends for specified locations', (done) => {
    const queryParams = 'locations[]=%7B%22origin%22:%22Lagos%22,%22destination%22:%22Nairobi,+Kenya%22%7D';
    request(app)
      .get(
        `/api/v1/travelStipends/location?${queryParams}`
      )
      .set('Authorization', requesterToken)
      .end((err, res) => {
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Stipends for locations found');
        expect(res.body.stipends[0]).toHaveProperty('amount');
        expect(res.body.stipends[0]).toHaveProperty('country');
        done();
      });
  });
  it('should retrun default stipends for counties with no stipend', (done) => {
    const queryParams = 'locations[]=%7B%22origin%22:%22Abuja%22,%22destination%22:%22Congosto,+Spain%22%7D';
    const expected = [{ amount: 30, country: 'Spain', id: 1 }];
    request(app)
      .get(
        `/api/v1/travelStipends/location?${queryParams}`
      )
      .set('Authorization', requesterToken)
      .end((err, res) => {
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Stipends for locations found');
        expect(res.body.stipends).toEqual(expected);
        done();
      });
  });

  it('should return message if no stipends are found', async (done) => {
    await models.TravelStipends.destroy({ force: true, truncate: { cascade: true } });
    const queryParams = 'locations[]=%7B%22origin%22:%22Lagos%22,%22destination%22:%22Nairobi,+Kenya%22%7D';
    request(app)
      .get(`/api/v1/travelStipends/location?${queryParams}`)
      .set('Authorization', requesterToken)
      .end((err, res) => {
        expect(res.status).toEqual(404);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('There was no stipends found for specified location(s)');
        done();
      });
  });
});
