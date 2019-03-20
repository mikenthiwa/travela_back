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

const {
  updatedTravelStipend, payload, payloadNotAdmin, travelStipend
} = mockData;
const superAdminToken = Utils.generateTestToken(payload);
const requesterToken = Utils.generateTestToken(payloadNotAdmin);

const updateTravelStipend = (
  data, id, done, expectations, bodyField = null, token = superAdminToken
) => {
  const server = request(app)
    .put(`${URI}/${id}`);
  if (token) {
    server.set('Authorization', token);
  }
  server.send(data);
  server.end((err, res) => {
    if (err) done(err);
    if (expectations) {
      expect(res.status).toEqual(expectations.status);
      expect(bodyField ? res.body[bodyField] : res.body)
        .toEqual(bodyField ? expectations[bodyField] : expectations.body);
    }
    done();
  });
};

describe('Update Travel Stipend', () => {
  let stipendId;

  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });
  
  beforeEach(async () => {
    await models.TravelStipends.destroy({ force: true, truncate: { cascade: true } });
    const response = await request(app)
      .post(URI)
      .set('AUthorization', superAdminToken)
      .send(travelStipend);
    stipendId = response.body.stipend.id;
  });
  
  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  describe('PUT /travelStipend/:id', () => {
    it('should require a token', (done) => {
      updateTravelStipend(
        updatedTravelStipend,
        stipendId,
        done,
        expectedResponse,
        null,
        null
      );
    });

    it('should ensure provided token is valid', (done) => {
      const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVcfrc2VySW5';

      updateTravelStipend(
        updatedTravelStipend,
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
      updateTravelStipend(
        updatedTravelStipend,
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

    it('should ensure travel stipend exists', (done) => {
      updateTravelStipend(
        {
          center: 'Lagos',
          stipend: 100
        },
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

    it('should successfully update the center and stipend', (done) => {
      updateTravelStipend(
        {
          center: 'Lagos',
          stipend: 100
        },
        stipendId,
        done,
        {
          status: 200,
          message: 'Travel stipend updated successfully'
        },
        'message',
        superAdminToken
      );
    });

    it('should not update if given center only', (done) => {
      updateTravelStipend(
        {
          center: 'Nairobi'
        },
        stipendId,
        done,
        {
          status: 422,
          errors: [
            {
              message: 'stipend has not been provided'
            }
          ]
        },
        'errors[0][\'message\']',
        superAdminToken
      );
    });

    it('should raise validation errors when updating with wrong keys', (done) => {
      updateTravelStipend(
        {
          stipended: 10
        },
        stipendId,
        done,
        {
          status: 422,
          message: 'Validation failed'
        },
        'message',
        superAdminToken
      );
    });
    it('should raise validation errors when stipendId is not an integer', (done) => {
      updateTravelStipend(
        {
          stipended: 10
        },
        'www',
        done,
        {
          status: 422,
          message: 'Validation failed'
        },
        'message',
        superAdminToken
      );
    });
  });
});
