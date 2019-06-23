import supertest from 'supertest';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import mocks from './__mocks__/tripModifications';
import app from '../../../app';

const request = supertest(app);

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
    createModification(done, '0001111', 200, ({ modification }) => {
      expect(modification).toMatchObject({
        status: 'Approved',
        requestId: '0001111',
        reason: 'This is also a reason',
        type: 'Modify Dates',
        approverId: 81110999
      });
    }, anotherModification(), tokens[2]);
  });

  it('should ensure a user only submits a modification for their request', (done) => {
    createModification(done, requests[1].id, 401, ({ message }) => {
      expect(message).toEqual('You are not authorized to modify this request');
    });
  });

  it('should return the list of modifications for a particular request', async (done) => {
    console.log(requests[24], tokens[2]);
    await createModificationAsync(requests[24].id, anotherModification(), tokens[2]);
    testApi(done, 'get', `/requests/${requests[24].id}/modifications`, 200,
      ({ pastModifications }) => {
        expect(pastModifications[0]).toMatchObject({
          reason: 'This is also a reason',
          status: 'Approved',
          type: 'Modify Dates',
          requestId: '0001112',
          approverId: 81110999,
          approvedBy: pastModifications[0].approvedBy,
          request: { id: '0001112' }
        });
      });
  });
});
