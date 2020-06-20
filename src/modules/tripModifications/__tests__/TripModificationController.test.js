import supertest from 'supertest';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import mocks from './__mocks__/tripModifications';
import app from '../../../app';

const request = supertest(app);

global.io = {
  sockets: {
    emit: (event, dataToBeEmitted) => dataToBeEmitted,
  },
};

const {
  users, requests, trips, userRoles, tokens, approvalsList, centers
} = mocks;

const newModification = (overrides = {}) => ({
  reason: 'This is a reason',
  type: 'Cancel Trip',
  ...overrides
});

const anotherModification = (overrides = {}) => ({
  reason: 'This is also a reason',
  type: 'Modify Dates',
  ...overrides
});

const api = (method, url, token, data) => new Promise((resolve, reject) => {
  request[method](`/api/v1${url}`)
    .set('authorization', token)
    .send(data)
    .end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
});

const testApi = (
  done, method, url, status, checkBody, data = newModification(), token = tokens[0],
) => {
  api(method, url, token, data)
    .then((res) => {
      if (status) {
        expect(res.status).toEqual(status);
      }
      checkBody(res.body);
      done();
    }).catch((err) => {
      done(err);
    });
};

const createModification = (done, requestId, status, checkBody, data, token) => {
  testApi(done, 'post', `/requests/${requestId}/modifications`, status, checkBody, data, token);
};

const createModificationAsync = (
  requestId, data = newModification(), token = tokens[0]
) => api('post', `/requests/${requestId}/modifications`, token, data);

describe('TripModificationController', () => {
  const destroyTables = async () => {
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ truncate: { cascade: true }, force: true });
    await models.User.destroy({ truncate: { cascade: true }, force: true });
    await models.Approval.destroy({ truncate: { cascade: true }, force: true });
    await models.Request.destroy({ truncate: { cascade: true }, force: true });
    await models.Trip.destroy({ truncate: { cascade: true }, force: true });
    await models.TripModification.destroy({ truncate: { cascade: true }, force: true });
  };

  beforeAll(async () => {
    await destroyTables();
    await models.Center.bulkCreate(centers);
    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(users);
    await models.UserRole.bulkCreate(userRoles);
    await models.Request.bulkCreate(requests);
    await models.Approval.bulkCreate(approvalsList);
    await models.Trip.bulkCreate(trips);
  });

  afterAll(async () => {
    await destroyTables();
  });

  it('should throw an error if a request does not exist', (done) => {
    const requestId = 'kadjkljdf';
    createModification(done, requestId, 404, ({ message }) => {
      expect(message).toEqual(`Request with id ${requestId} does not exist`);
    });
  });

  it('should validate the trip modification request', (done) => {
    createModification(done, requests[0].id, 422, ({ errors }) => {
      expect(errors[0].message).toEqual(
        'Modification type should either be "Cancel Trip" or "Modify Dates"'
      );
      expect(errors[1].message).toEqual('Modification reason is required');
    }, newModification({ reason: null, type: 'Invalid type' }));
  });

  it('should ensure a modification can only be submitted after approval', (done) => {
    createModification(done, requests[0].id, 400, ({ message }) => {
      expect(message).toEqual(
        'A modification request can only be made on a request after approval by the manager'
      );
    });
  });

  it('should create a successful modification request and delete the request', (done) => {
    createModification(done, requests[3].id, 200, ({ modification }) => {
      expect(modification).toMatchObject({
        status: 'Approved',
        requestId: requests[3].id,
        reason: 'This is a reason',
        type: 'Cancel Trip',
        approverId: 178912
      });
    });
  });

  it('should create a successful modification request for modify dates type', (done) => {
    global.io = {
      sockets: {
        emit: () => {}
      }
    };
    createModification(done, '0001111', 200, ({ modification }) => {
      expect(modification).toMatchObject({
        status: 'Open',
        requestId: '0001111',
        reason: 'This is also a reason',
        type: 'Modify Dates',
        approverId: null
      });
    }, anotherModification(), tokens[2]);
  });

  it('should edit the request and return 200 when modifying and updating a request', (done) => {
    request
      .put('/api/v1/requests/0001111')
      .set('authorization', tokens[2])
      .send({
        ...requests[23],
        trips: [{
          ...trips[23],
          departureDate: '2019-10-11',
          returnDate: '2019-10-15',
        }],
        stipend: 600,
        stipendBreakdown: [{
          subTotal: 600,
          location: 'New York, United States',
          dailyRate: 300,
          duration: 2,
          centerExists: true
        }],
      })
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        done();
      });
  });


  it('should ensure a user only submits a modification for their request', (done) => {
    createModification(done, requests[1].id, 401, ({ message }) => {
      expect(message).toEqual('You are not authorized to modify this request');
    });
  });

  it('should return the list of modifications for a particular request', async (done) => {
    await createModificationAsync(requests[5].id, anotherModification(), tokens[0]);

    await models.TripModification.update(
      { status: 'Approved', approverId: 178912 },
      { where: { requestId: requests[5].id } }
    );

    testApi(done, 'get', `/requests/${requests[5].id}/modifications`, 200,
      ({ pastModifications }) => {
        expect(pastModifications[0]).toMatchObject({
          status: 'Approved',
          type: 'Modify Dates',
          requestId: '98733',
          approverId: 178912,
          request: { id: '98733' }
        });
      });
  });
});
