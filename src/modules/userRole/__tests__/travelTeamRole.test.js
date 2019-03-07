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

const payload2 = {
  UserInfo: {
    id: 'wer45660treui',
    fullName: 'second test user',
    name: 'second test user',
    email: 'secondTestuser@andela.com',
    picture: 'fakePicture.png'
  },
};

const token = Utils.generateTestToken(payload);
const secondToken = Utils.generateTestToken(payload2);

describe('Travel team role test', () => {
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
        location: 'Nigeria'
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
    it(`should return error if field is empty when
    adding new travel team member`, (done) => {
      request(app)
        .put('/api/v1/user/role/update')
        .set('authorization', token)
        .expect(422)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.errors).toEqual([
            { message: 'Please provide a valid email', name: 'email' },
            { message: 'roleName is required', name: 'roleName' }
          ]);
          done();
        });
    });
    it('should return 400 error if email is not an Andela email', (done) => {
      request(app)
        .put('/api/v1/user/role/update')
        .set('authorization', token)
        .send({
          email: 'someEmail@anerla.com',
          roleName: 'travel team member',
          center: 'Lagos, Nigeria'
        })
        .expect(400)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.message)
            .toEqual('Only Andela Email address allowed');
          done();
        });
    });
    it('should return 404 error if the email does not exist', (done) => {
      moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=someEmail@andela.com`, {
        status: 200,
        response: {
          values: [],
          total: 0
        }
      });
      request(app)
        .put('/api/v1/user/role/update')
        .set('authorization', token)
        .send({
          email: 'someEmail@andela.com',
          roleName: 'travel team member',
          center: 'Lagos, Nigeria'
        })
        .expect(404)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.error)
            .toEqual('Email does not exist');
          done();
        });
    });
    it('should return 400 error if the center is not provided', (done) => {
      request(app)
        .put('/api/v1/user/role/update')
        .set('authorization', token)
        .send({
          email: 'test.user@andela.com',
          roleName: 'travel team member',
        })
        .expect(400)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.message)
            .toEqual('Please provide center');
          done();
        });
    });
    it('should return 404 error if the center does not exist', (done) => {
      request(app)
        .put('/api/v1/user/role/update')
        .set('authorization', token)
        .send({
          email: 'test.user@andela.com',
          roleName: 'travel team member',
          center: 'London, UK'
        })
        .expect(404)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.error)
            .toEqual('Center does not exist');
          done();
        });
    });
    it('should create travel team members',
      (done) => {
        request(app)
          .put('/api/v1/user/role/update')
          .set('authorization', token)
          .send({
            email: 'test.user@andela.com',
            roleName: 'travel team member',
            center: 'Lagos, Nigeria'
          })
          .expect(200)
          .end((err, res) => {
            expect(res.body.success).toEqual(true);
            expect(res.body.message)
              .toEqual('Role updated successfully');
            expect(res.body.result.centers[0].location)
              .toEqual('Lagos, Nigeria');
            done();
          });
      });
    it(`should create return 409 error if user
      is already a travel team member`,
    (done) => {
      request(app)
        .put('/api/v1/user/role/update')
        .set('authorization', token)
        .send({
          email: 'test.user@andela.com',
          roleName: 'travel team member',
          center: 'Lagos, Nigeria'
        })
        .expect(409)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.error)
            .toEqual('User already has this role');
          done();
        });
    });
  });
  describe('Travel admin assigning roles other than travel team member', () => {
    beforeAll((done) => {
      moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=secondTestuser@andela.com`, {
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
          supervisorEId: '92'
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
      moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=william.sserubiri@andela.com`, {
        status: 200,
        response: {
          values: [{
            email: 'william.sserubiri@andela.com',
            name: 'ssewilliam',
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
        .set('authorization', secondToken)
        .send({ location: 'Lagos' })
        .expect(201)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
    it('should assign travel administrator role to second user', (done) => {
      request(app)
        .put('/api/v1/user/role/update')
        .set('authorization', token)
        .expect(200)
        .send({
          email: 'secondTestuser@andela.com',
          roleName: 'Travel administrator'
        })
        .end((err, res) => {
          expect(res.body.message).toEqual('Role updated successfully');
          done();
        });
    });
    it(`should throw 403 error if travel administrator tries to assign
    another role apart from travel team member`, (done) => {
      request(app)
        .put('/api/v1/user/role/update')
        .set('authorization', secondToken)
        .expect(403)
        .send({
          email: 'secondTestuser@andela.com',
          roleName: 'Travel administrator'
        })
        .end((err, res) => {
          expect(res.body.error)
            .toEqual('Only a Super Admin can assign that role');
          done();
        });
    });
  });
});
