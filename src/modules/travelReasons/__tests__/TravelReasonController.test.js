import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import Utils from '../../../helpers/Utils';
import createTravelReasonMock from './__mock__/createTravelReasonMock';

const request = supertest;


const prepareDatabase = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.Center.destroy({ force: true, truncate: { cascade: true } });
  await models.TravelReason.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
};

describe('create travel reasons', () => {
  const {
    user,
    user2,
    payload2,
    payload,
    SuperAdminRole,
    validTravelReason,
    validTravelReason2,
    invalidTravelReasonDescription,
    invalidTravelReasonTitle,
    centers
  } = createTravelReasonMock;

  const token = Utils.generateTestToken(payload);
  const token2 = Utils.generateTestToken(payload2);

  beforeAll(async () => {
    await prepareDatabase();
    await models.Role.bulkCreate(role);
    await models.User.create(user);
    await models.Center.create(centers);
    await models.UserRole.create(SuperAdminRole);
    await models.User.create(user2);
  });

  afterAll(async () => {
    await prepareDatabase();
  });

  const testClient = (method = 'post', params) => request(app)[method](
    `/api/v1/request/reasons/${params || ''}`
  ).set('authorization', token);

  const createTravelReason = async (travelReason = validTravelReason, clear = true) => {
    if (clear) {
      await models.TravelReason.destroy({ force: true, truncate: { cascade: true } });
    }
    const response = await testClient()
      .send(travelReason);
    return response.body.travelReason;
  };

  it('should fail to add a travel reason because of invalid title', (done) => {
    testClient()
      .send(invalidTravelReasonTitle)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('Validation failed');
        expect(res.body.errors[0].message).toEqual(
          'Title should not be more than 18 characters'
        );
        expect(res.body.success).toEqual(false);
        done();
      });
  });

  it('should fail to add a travel reason if the title is of invalid type', (done) => {
    testClient()
      .send({ ...validTravelReason, title: { } })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('Validation failed');
        expect(res.body.errors[0].message).toEqual('Title should be a string');
        expect(res.body.success).toEqual(false);
        done();
      });
  });

  it('should fail to add a travel reason if the description is of invalid type', (done) => {
    testClient()
      .send({ ...validTravelReason, description: { } })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('Validation failed');
        expect(res.body.errors[0].message).toEqual('Description should be a string');
        expect(res.body.success).toEqual(false);
        done();
      });
  });

  it('should fail to add a travel reason because of invalid description', (done) => {
    testClient()
      .send(invalidTravelReasonDescription)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('Validation failed');
        expect(res.body.errors[0].message).toEqual(
          'Description should not be more than 140 characters'
        );
        expect(res.body.success).toEqual(false);
        done();
      });
  });

  it('should fail to add a travel reason when lacking permissions', (done) => {
    request(app).post('/api/v1/request/reasons').set('authorization', token2)
      .set('Content-Type', 'application/json')
      .send(validTravelReason)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('You don\'t have access to perform this action');
        done();
      });
  });

  it('should successfully add a travel reason as a super admin', (done) => {
    testClient()
      .send(validTravelReason)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(201);
        expect(res.body.message).toEqual('Successfully created a travel reason');
        expect(res.body.success).toEqual(true);
        expect(res.body.travelReason.title).toEqual('boot camp');
        done();
      });
  });

  it('should successfully fail to add the same reason twice', (done) => {
    testClient()
      .send(validTravelReason2)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('This travel reason already exists');
        expect(res.body.success).toEqual(false);
        done();
      });
  });

  it('should fetch a single travel reason', async (done) => {
    const { id } = await createTravelReason();
    testClient('get', id)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.travelReason.title).toEqual('boot camp');

        done();
      });
  });

  it('should return the appropriate response if the id is not an integer', async (done) => {
    testClient('get', 'invalidId')
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(400);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Travel reason id must be a number');
        done();
      });
  });

  it('should update the travel reason', async (done) => {
    const { id } = await createTravelReason();
    testClient('put', id)
      .send({ title: 'This is another' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.travelReason.title).toEqual('This is another');
        expect(res.body.travelReason.description)
          .toEqual(validTravelReason.description);
        done();
      });
  });

  it('should not update the travel reason if it duplicates another title',
    async (done) => {
      await createTravelReason();
      const { id } = await createTravelReason({
        ...validTravelReason,
        title: 'Travela'
      }, false);

      testClient('put', id)
        .send({ title: 'boot camp' })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(422);
          expect(res.body.message).toEqual('This travel reason already exists');
          done();
        });
    });

  it('should return appropriate response if a travel reason does not exist',
    (done) => {
      testClient('get', 1123)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(404);
          expect(res.body.error).toEqual('Travel Reason does not exist');
          done();
        });
    });

  it('should fail while deleting a travel reason with a wrong param', (done) => {
    request(app)
      .delete('/api/v1/request/reasons/a')
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual('Travel reason id must be a number');
        done();
      });
  });

  it('should return 404 while deleting a non existing reason', (done) => {
    request(app)
      .delete('/api/v1/request/reasons/38')
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(404);
        expect(res.body.error).toEqual('Travel Reason does not exist');
        done();
      });
  });

  it('should successfully delete a created travel reason', async (done) => {
    const { id } = await createTravelReason();
    request(app)
      .delete(`/api/v1/request/reasons/${id}`)
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('Travel Reason deleted successfully');
        done();
      });
  });
});
