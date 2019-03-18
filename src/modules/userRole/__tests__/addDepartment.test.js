import request from 'supertest';
import moxios from 'moxios';
import app from '../../../app';
import models from '../../../database/models';
import {
  role
} from './mocks/mockData';
import centers from '../../centers/__tests__/mocks/mockData';
import Utils from '../../../helpers/Utils';

const payload = {
  UserInfo: {
    id: 'wer45660+++',
    fullName: 'test user',
    name: 'test user',
    email: 'test.user@andela.com',
    picture: 'fakePicture.png'
  },
};

const token = Utils.generateTestToken(payload);

describe('Budget Checker role test', () => {
  beforeAll(async (done) => {
    moxios.install();
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.Role.bulkCreate(role);
    await models.User.destroy({ truncate: true, cascade: true });
    await models.UserRole
      .destroy({ truncate: true, cascade: true });
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.Center.bulkCreate(centers);
    process.env.DEFAULT_ADMIN = 'test.user@andela.com';
    moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=test.user@andela.com`, {
      status: 200,
      response: {
        values: [{
          bamboo_hr_id: '01',
        }]
      }
    });
    moxios.stubRequest(process.env.BAMBOOHR_API.replace('{bambooHRId}', '01'), {
      status: 200,
      response: {
        workEmail: 'lisa.doe@andela.com',
        supervisorEId: '92',
        location: 'Nigeria',
        department: 'Partner-Programs',
      }
    });
    moxios.stubRequest(process.env.BAMBOOHR_API.replace('{bambooHRId}', '92'), {
      status: 200,
      response: {
        id: '92',
        displayName: 'ssewilliam',
        firstName: 'William',
        lastName: 'Sserubiri',
        jobTitle: 'Engineering Team Lead',
        department: 'Partner-Programs',
        location: 'Kenya',
        workEmail: 'william.sserubiri@andela.com',
        supervisorEId: '9',
        supervisor: 'Samuel Kubai'
      }
    });
    moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?bamboo_hr_id=92`, {
      status: 200,
      response: {
        values: [{
          email: 'william.sserubiri@andela.com',
          name: 'ssewilliam',
          department: 'Partner-Programs',
          id: '92',
          location: { name: 'Kampala' },
          picture: 'http//:gif.jpg'
        }]
      }
    });
    moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=william.sserubiri@andela.com`, {
      status: 200,
      response: {
        values: [{
          email: 'william.sserubiri@andela.com',
          name: 'ssewilliam',
          department: 'Partner-Programs',
          id: '92',
          location: {
            name: 'Kampala'
          },
          picture: 'http//:gif.jpg'
        }]
      }
    });
    request(app)
      .post('/api/v1/user')
      .set('authorization', token)
      .send({ location: 'Lagos' })
      .expect(201)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });

  afterAll(async () => {
    moxios.uninstall();
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.Center.destroy({ truncate: true, cascade: true });
  });


  describe('Authenticated user', () => {
    beforeAll((done) => {
      request(app)
        .put('/api/v1/user/admin')
        .set('authorization', token)
        .expect(200)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
    it('should return error if department is not given when adding ae budget checker',
      (done) => {
        request(app)
          .put('/api/v1/user/role/update')
          .set('authorization', token)
          .send({
            email: 'test.user@andela.com',
            roleName: 'Budget Checker',
          })
          .expect(200)
          .end((err, res) => {
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('You have to add department in an array when adding a user to a budget checker role');
            done();
          });
      });

    it('should return error if department is not an array when adding a budget checker',
      (done) => {
        request(app)
          .put('/api/v1/user/role/update')
          .set('authorization', token)
          .send({
            email: 'test.user@andela.com',
            roleName: 'Budget Checker',
            departments: 'People'
          })
          .expect(200)
          .end((err, res) => {
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('Department must be an array and cannot be empty');
            done();
          });
      });

    it('should return error if department is less than one when adding a budget checker',
      (done) => {
        request(app)
          .put('/api/v1/user/role/update')
          .set('authorization', token)
          .send({
            email: 'test.user@andela.com',
            roleName: 'Budget Checker',
            departments: 'People'
          })
          .expect(200)
          .end((err, res) => {
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('Department must be an array and cannot be empty');
            done();
          });
      });


    it('should create budget checker',
      (done) => {
        request(app)
          .put('/api/v1/user/role/update')
          .set('authorization', token)
          .send({
            email: 'test.user@andela.com',
            roleName: 'Budget Checker',
            departments: ['Fellow', 'staff']
          })
          .expect(200)
          .end((err, res) => {
            expect(res.body.success).toEqual(true);
            expect(res.body.message)
              .toEqual('Role updated successfully');
            done();
          });
      });
  });
});
