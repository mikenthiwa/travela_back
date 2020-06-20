import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import { user, role } from './mocks/mockData';

const request = supertest;
const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJpZCI6Ii1MSEptS3J4'; // eslint-disable-line
const { user5, user6, user7 } = user;

describe('Delete user role', () => {
  const payload = {
    UserInfo: {
      id: '1234',
      name: 'monkey',
      email: 'monkey@andela.com',
    }
  };

  const payload1 = {
    UserInfo: {
      id: '5678',
      name: 'leopard',
      email: 'leopard@andela.com',
    },
  };

  const userRole = [
    {
      id: 1,
      userId: user5.id,
      roleId: 10948,
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
    {
      id: 2,
      userId: user5.id,
      roleId: 339458,
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
    {
      id: 3,
      userId: user6.id,
      roleId: 29187,
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
    {
      id: 4,
      userId: user6.id,
      roleId: 339458,
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
    {
      id: 5,
      userId: user7.id,
      roleId: 339458,
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    }
  ];

  beforeAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.bulkCreate([user5, user6, user7]);
    await models.UserRole.bulkCreate(userRole);
  });

  afterAll(async () => {
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  });

  describe('DELETE /api/v1/user/roles/:userId/:roleId', () => {
    const superAdminToken = Utils.generateTestToken(payload);
    const travelAdministratorToken = Utils.generateTestToken(payload1);

    it('should not delete role if user do not provide a token', (done) => {
      const expectedResponse = {
        status: 401,
        body: {
          success: false,
          error: 'Please provide a token',
        },
      };

      request(app)
        .delete(`/api/v1/user/roles/${user7.id}/339458`)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body).toMatchObject(expectedResponse.body);
          done();
        });
    });

    it('should not delete role if token is invalid', (done) => {
      const expectedResponse = {
        status: 401,
        body: {
          success: false,
          error: 'Token is not valid',
        },
      };

      request(app)
        .delete(`/api/v1/user/roles/${user7.id}/339458`)
        .set('authorization', invalidToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body).toMatchObject(expectedResponse.body);
          done();
        });
    });


    it('should return error if `role` do not exist', (done) => {
      const expectedResponse = {
        status: 404,
        body: {
          success: false,
          error: 'Role does not exist'
        },
      };

      request(app)
        .delete(`/api/v1/user/roles/${user6.id}/454`)
        .set('authorization', travelAdministratorToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body).toMatchObject(expectedResponse.body);
          done();
        });
    });

    it('should not allow a`travel admin` to delete a `super admin` role',
      (done) => {
        const expectedResponse = {
          status: 403,
          body: {
            success: false,
            error: `Only a 'Super Administrator' can change the role of another 'Super Administrator'` // eslint-disable-line
          },
        };

        request(app)
          .delete(`/api/v1/user/roles/${user5.id}/10948`)
          .set('authorization', travelAdministratorToken)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

    it('should return error if a user with the roleId do not exist',
      (done) => {
        const expectedResponse = {
          status: 404,
          body: {
            success: false,
            error: `User with the role: 'Requester' does not exist` // eslint-disable-line
          },
        };

        request(app)
          .delete('/api/v1/user/roles/12345/401938')
          .set('authorization', travelAdministratorToken)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

    it('should allow `Super Admin` to delete role',
      (done) => {
        const expectedResponse = {
          status: 200,
          body: {
            success: true,
            message: `User can no longer perform operations associated with the role: 'Travel Team Member'` // eslint-disable-line
          },
        };

        request(app)
          .delete(`/api/v1/user/roles/${user6.id}/339458`)
          .set('authorization', superAdminToken)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

    it('should allow `Travel Admin` to delete role',
      (done) => {
        const expectedResponse = {
          status: 200,
          body: {
            success: true,
            message: `User can no longer perform operations associated with the role: 'Travel Team Member'` // eslint-disable-line
          },
        };

        request(app)
          .delete(`/api/v1/user/roles/${user7.id}/339458`)
          .set('authorization', travelAdministratorToken)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });
  });
});
