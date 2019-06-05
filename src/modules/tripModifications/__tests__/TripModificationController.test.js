import supertest from 'supertest';
import querystring from 'querystring';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import mocks from './__mocks__/tripModifications';
import app from '../../../app';
import NotificationEngine from '../../notifications/NotificationEngine';

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

const updateModification = (overrides = {}) => ({
  status: 'Approved',
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


const updateModificationAsync = (
  id, data = updateModification(), token = tokens[1]
) => api('put', `/requests/modifications/${id}`, token, data);

const createModificationAsync = (
  requestId, data = newModification(), token = tokens[0]
) => api('post', `/requests/${requestId}/modifications`, token, data);


const getModifications = query => api('get', `/tripModifications?${querystring.stringify(query)}`, tokens[1]);


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

  it('should fetch all modifications when none has been created by the users', async () => {
    const { body: { approvals } } = await getModifications();
    expect(approvals.length).toEqual(0);
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

  it('should validate the approval of a modification request',
    async (done) => {
      const { body: { modification: { id } } } = await createModificationAsync(requests[5].id);

      testApi(done, 'put', `/requests/modifications/${id}`, 422, ({ errors }) => {
        expect(errors[0].message).toEqual('Approval status can either be "Approved" or "Rejected"');
      }, { type: 'Cancel Trip' }, tokens[1]);
    });

  it('should ensure a modification can only be approved/rejected once', async () => {
    const { body: { modification: { id } } } = await createModificationAsync(requests[7].id);
    await updateModificationAsync(id, { status: 'Rejected' });
    const { body: { message } } = await updateModificationAsync(id, { status: 'Approved' });

    expect(message).toEqual('Trip modification request has already been approved/rejected');
  });

  it('should ensure a modification exists before updating', async () => {
    const { body: { message } } = await updateModificationAsync(12323, { status: 'Approved' });
    expect(message).toEqual('Trip modification with id 12323 does not exist');
  });

  it('should create a successful modification request for modify dates type', (done) => {
    createModification(done, requests[22].id, 201, ({ modification }) => {
      expect(modification).toMatchObject({
        status: 'Open',
        requestId: requests[22].id,
        reason: 'This is also a reason',
        type: 'Modify Dates',
        approverId: null
      });
    }, anotherModification(), tokens[2]);
  });

  it('should ensure a user cannot create a duplicate modification request', async (done) => {
    NotificationEngine.notify = jest.fn();
    NotificationEngine.sendMailToMany = jest.fn();

    await createModificationAsync(requests[22].id, anotherModification(), tokens[2]);
    createModification(done, requests[22].id, 400, ({ message }) => {
      expect(message).toEqual('You already have a pending trip modification for this request');
    }, anotherModification(), tokens[2]);
  });

  it('should ensure a user only submits a modification for their request', (done) => {
    createModification(done, requests[1].id, 401, ({ message }) => {
      expect(message).toEqual('You are not authorized to modify this request');
    });
  });

  it('should return the list of modifications for a particular request', async (done) => {
    await createModificationAsync(requests[24].id, anotherModification(), tokens[2]);
    testApi(done, 'get', `/requests/${requests[24].id}/modifications`, 200,
      ({ pendingModification }) => {
        expect(pendingModification).toMatchObject({
          reason: 'This is also a reason',
          status: 'Open',
          type: 'Modify Dates',
          requestId: '0001112',
          approverId: null,
          approvedBy: null,
          request: { id: '0001112' }
        });
      });
  });

  it('should allow the travel team to approve a modification request', async () => {
    NotificationEngine.notify = jest.fn();
    NotificationEngine.sendMailToMany = jest.fn();
    
    const { body: { modification: { id } } } = await createModificationAsync(requests[23].id, anotherModification(), tokens[2]);
    const { body: { message } } = await updateModificationAsync(id, { status: 'Approved' });
    expect(message).toEqual('Request 0001111\'s modification has been successfully approved');
  });

  it('should fetch all open modifications created by the users', async () => {
    const { body: { approvals } } = await getModifications();
    expect(approvals.length).toEqual(2);
  });
});
