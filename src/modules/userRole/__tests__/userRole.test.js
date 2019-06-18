import request from 'supertest';
import axios from 'axios';
import moment from 'moment';
import moxios from 'moxios';
import app from '../../../app';
import models from '../../../database/models';
import {
  role,
  userRole,
  newRole,
  profile,
  userMock,
  userRoles,
  center,
  googleToken,
  keys,
  nonAndelaToken
} from './mocks/mockData';
import Utils from '../../../helpers/Utils';

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'captain america',
    name: 'captain america',
    email: 'captain.america@andela.com',
    picture: 'fake.png'
  },
};

const payload2 = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'captain america',
    name: 'captain america',
    email: 'captain.@andela.com',
    picture: 'fake.png'
  },
};


const payload4 = {
  UserInfo: {
    id: '-jdif34444',
    fullName: 'Nice Guy ',
    name: 'Nice Guy ',
    email: 'nice.guy@andela.com',
    picture: 'fake.png'
  },
};

const updateRoleData = {
  id: 10948,
  roleName: 'Super Administrator',
  description: 'Can perform all task on travela',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01'
};

const userPayload = {
  UserInfo: {
    id: '333',
    fullName: 'Wilson Kamau',
    name: 'Wilson Kamau',
    email: 'wilson.gaturu@andela.com',
    picture: 'https://lh5.googleusercontent.com/-9PPHMmSAkxg/AAAAAAAAAAI/AAAAAAAAAAc/c6lcNC972W0/s96-c/photo.jpg',
    roles: null
  }
};

const invalidTokenPayload = {
  email: 'some.email@andela.com'
};

const token = Utils.generateTestToken(payload);
const token2 = Utils.generateTestToken(userPayload);
const token3 = Utils.generateTestToken(payload2);
const unSeededUserToken = Utils.generateTestToken(payload4);
const invalidToken = Utils.generateTestToken(invalidTokenPayload);

describe('User Role Test', () => {
  beforeAll(async () => {
    moxios.install();
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    process.env.DEFAULT_ADMIN = 'captain.america@andela.com';
    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.Center.bulkCreate(center);
    await models.UserRole.bulkCreate(userRoles);
  });

  afterAll(async () => {
    moxios.uninstall();
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
  });

  it('should return 401 Unauthorized users', (done) => {
    request(app)
      .get('/api/v1/user')
      .expect(401)
      .end((err) => {
        if (err) {
          done(err);
        }
        done();
      });
  });

  it('should return the user if it exists', (done) => {
    moxios.stubRequest('https://www.googleapis.com/oauth2/v3/certs', {
      status: 200,
      response: keys
    });
    moxios.stubRequest(process.env.BAMBOOHR_API.replace('{bambooHRId}', '333'), {
      status: 200,
      response: {
        id: '333',
        displayName: 'WilsonG',
        firstName: 'Wilson',
        lastName: 'Kamau',
        jobTitle: 'Fellows-TDD',
        department: 'Fellows Partnership',
        location: 'Kenya',
        workEmail: 'wilson.gaturu@andela.com',
        supervisorEId: '20200',
        supervisor: 'Samuel Kubai'
      }
    });
    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json')
      .send({ token: googleToken.token })
      .expect(201)
      .end((err, res) => {
        expect(res.body.message).toEqual('User Found');
        expect(res.body.success).toEqual(true);
        if (err) return done(err);
        done();
      });
  });

  it('should return 401 if a token is not provided', (done) => {
    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json')
      .send({})
      .expect(401)
      .end((err, res) => {
        expect(res.body.message).toEqual('Please Provide a token');
        expect(res.body.success).toEqual(false);
        if (err) return done(err);
        done();
      });
  });

  it('should return invalid token if it cannot verify token', (done) => {
    moxios.stubRequest('https://www.googleapis.com/oauth2/v3/certs', {
      status: 200,
      response: keys
    });
    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json')
      .send({ token: invalidToken })
      .expect(401)
      .end((err, res) => {
        expect(res.body.message).toEqual('Invalid Token');
        expect(res.body.success).toEqual(false);
        if (err) return done(err);
        done();
      });
  });

  it('should return 500 error if invalid token', (done) => {
    moxios.stubRequest('https://www.googleapis.com/oauth2/v3/certs', {
      status: 200,
      response: keys
    });
    moxios.stubRequest(process.env.BAMBOOHR_API.replace('{bambooHRId}', '333'), {
      status: 200,
      response: {
        id: '333',
        displayName: 'WilsonG',
        firstName: 'Wilson',
        lastName: 'Kamau',
        jobTitle: 'Fellows-TDD',
        department: 'Fellows Partnership',
        location: 'Kenya',
        workEmail: 'wilson.gaturu@andela.com',
        supervisorEId: '20200',
        supervisor: 'Samuel Kubai'
      }
    });
    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json')
      .send({ token: 'googleToken.token' })
      .expect(500)
      .end((err, res) => {
        expect(res.status).toEqual(500);
        if (err) return done(err);
        done();
      });
  });

  it('should return error if email is not an andela email address', (done) => {
    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json')
      .send({ token: nonAndelaToken.token })
      .expect(401)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Only Andela Email address allowed');
        if (err) return done(err);
        done();
      });
  });


  it('should return only one user from the database', (done) => {
    request(app)
      .get('/api/v1/user/20200')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        if (err) return done(err);
        done();
      });
  });

  it('should update the last login of a user', (done) => {
    request(app)
      .get('/api/v1/user/-MUyHJmKrxA90lPNQ1FOLNm')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        expect(moment(res.body.result.lastLogin).toDate().toDateString())
          .toEqual(new Date().toDateString());
        expect(res.body.success).toEqual(true);
        if (err) return done(err);
        done();
      });
  });

  it('should throw 404 error when getting a user that does not exist in the database', (done) => {
    request(app)
      .get('/api/v1/user/JNDVNFSFDKuytom')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(404)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('User not found');
        if (err) return done(err);
        done();
      });
  });

  it(`should return error if login user does not
  exist in database when changing user role`, (done) => {
    request(app)
      .put('/api/v1/user/role/update')
      .set('Content-Type', 'application/json')
      .set('authorization', token3)
      .send(userRole.superAdminRole)
      .expect(400)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual(
          'You are not signed in to the application',
        );
        if (err) return done(err);
        done();
      });
  });

  it('should return error when changing user role and user is not a super admin', (done) => {
    request(app)
      .put('/api/v1/user/role/update')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(userRole.superAdminRole)
      .expect(403)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.error)
          .toEqual('You don\'t have access to perform this action');
        if (err) return done(err);
        done();
      });
  });
  it(`should throw error if user does not exist in the database
  when user is set to super admin`, (done) => {
    request(app)
      .put('/api/v1/user/admin')
      .set('Content-Type', 'application/json')
      .set('authorization', token3)
      .expect(400)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Email does not exist in Database');
        if (err) return done(err);
        done();
      });
  });

  it('should change user to super admin', (done) => {
    request(app)
      .put('/api/v1/user/admin')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Your role has been Updated to a Super Admin');
        if (err) return done(err);
        done();
      });
  });

  it(`should throw if email does not match process env
  when changing user to super admin`, (done) => {
    request(app)
      .put('/api/v1/user/admin')
      .set('Content-Type', 'application/json')
      .set('authorization', token2)
      .send(userRole.superAdminRole)
      .expect(409)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Email does not match');
        if (err) return done(err);
        done();
      });
  });

  it('should updated user role to admin', (done) => {
    request(app)
      .put('/api/v1/user/role/update')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(userRole.superAdminRole)
      .expect(200)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Role updated successfully');
        if (err) return done(err);
        done();
      });
  });

  it('should update user profile', (done) => {
    request(app)
      .put('/api/v1/user/333/profile')
      .set('Content-Type', 'application/json')
      .set('authorization', token2)
      .send(profile.profile1)
      .expect(200)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Profile updated successfully');
        if (err) return done(err);
        done();
      });
  });

  it('should update user profile including their location', (done) => {
    request(app)
      .put('/api/v1/user/333/profile')
      .set('authorization', token2)
      .send({ ...profile.profile1, location: 'San Fransisco' })
      .expect(200)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Profile updated successfully');
        expect(res.body.result.location).toEqual('San Fransisco');
        if (err) return done(err);
        done();
      });
  });
  it('should not update user profile of another user', (done) => {
    request(app)
      .put('/api/v1/user/-MUyHJmKrxA/profile')
      .set('Content-Type', 'application/json')
      .set('authorization', token2)
      .send(profile.profile1)
      .expect(403)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('You cannot perform this operation');
        if (err) return done(err);
        done();
      });
  });

  it('should get all users in the database', (done) => {
    request(app)
      .get('/api/v1/user')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        if (err) return done(err);
        done();
      });
  });

  it('should get all users emails in the database', (done) => {
    request(app)
      .get('/api/v1/user')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        if (err) return done(err);
        done();
      });
  });

  it('should throw an error if the gender is wrong', (done) => {
    request(app)
      .put('/api/v1/user/333/profile')
      .set('Content-Type', 'application/json')
      .set('authorization', token2)
      .send(profile.profile2)
      .expect(400)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        if (err) return done(err);
        done();
      });
  });

  it('should throw error when field is empty when super admin is adding new role', (done) => {
    request(app)
      .post('/api/v1/user/role')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(userRole.newRole)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Validation failed');
        if (err) return done(err);
        done();
      });
  });

  it('should return error if email does not exist when updating user role', (done) => {
    axios.get = jest.fn(() => Promise.resolve({
      data: {
        values: [],
        total: 0
      }
    }));
    request(app)
      .put('/api/v1/user/role/update')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(userRole.superAdminRole2)
      .expect(404)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Email does not exist');
        if (err) return done(err);
        done();
      });
  });

  it('should change the role of a user that has not logged in for the first time', async (done) => {
    axios.get = jest.fn(() => Promise.resolve({
      data: {
        department: 'Partner-Programs',
        values: [
          {
            id: 'jdddd',
            email: 'black.widow@andela.com',
            first_name: 'Black',
            last_name: 'Widow',
            name: 'Black Widow',
            picture: 'photo.jpg?sz=50Vn',
            department: 'Partner-Programs',
            status: 'active',
            location: {
              name: 'Wakanda'
            },
          }
        ],
        total: 1,
      }
    }));
    request(app)
      .put('/api/v1/user/role/update')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .send({ email: 'black.widow@andela.com', roleName: 'manager' })
      .end((err, res) => {
        expect(res.body.result.email).toEqual('black.widow@andela.com');
        expect(res.body.result.name).toEqual('Black Widow');
        if (err) return done(err);
        done();
      });
  });

  it('should throw an error if the user does not exist', (done) => {
    request(app)
      .put('/api/v1/user/-jdif34444/profile')
      .set('Content-Type', 'application/json')
      .set('authorization', unSeededUserToken)
      .send(profile.profile1)
      .expect(400)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('User does not exist');
        if (err) return done(err);
        done();
      });
  });

  it('should throw error when role Name is not provided when adding new role for user ', (done) => {
    request(app)
      .put('/api/v1/user/role/update')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(newRole.saveSuperAdminRole)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Validation failed');
        if (err) return done(err);
        done();
      });
  });

  it('should throw error when role does not exist when updating user role ', (done) => {
    request(app)
      .put('/api/v1/user/role/update')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(userRole.managerRole)
      .expect(404)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Role does not exist');
        if (err) return done(err);
        done();
      });
  });

  it(`should throw error if role already exist when adding
  new role when user is super admin `, (done) => {
    request(app)
      .post('/api/v1/user/role')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(newRole.traveTeamRole)
      .expect(409)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Role already exist');
        if (err) return done(err);
        done();
      });
  });

  describe('Role Test', () => {
    it('should add new role when user is super admin ', (done) => {
      request(app)
        .post('/api/v1/user/role')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .send(newRole.saveSuperAdminRole)
        .expect(201)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Role created successfully');
          if (err) return done(err);
          done();
        });
    });

    it('should update role when user is super admin', (done) => {
      request(app)
        .patch('/api/v1/user/role/10948')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .send(updateRoleData)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('User role updated successfully');
          if (err) return done(err);
          done();
        });
    });

    it('should return error message when wrong role id is passed', (done) => {
      request(app)
        .patch('/api/v1/user/role/1094')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .send(updateRoleData)
        .expect(404)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('User role with that Id does not exist');
          if (err) return done(err);
          done();
        });
    });

    it('should get all roles in the database', (done) => {
      request(app)
        .get('/api/v1/user/roles')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          if (err) return done(err);
          done();
        });
    });

    it('should return error if params is not a integer', (done) => {
      request(app)
        .get('/api/v1/user/roles/irfir')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .expect(400)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Params must be an integer');
          if (err) return done(err);
          done();
        });
    });

    it('should return only one role from the database', (done) => {
      request(app)
        .get('/api/v1/user/roles/10948')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          if (err) return done(err);
          done();
        });
    });

    it('should return search result for a role from the database', (done) => {
      request(app)
        .get('/api/v1/user/roles/10948?search=cap')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          if (err) return done(err);
          done();
        });
    });

    it('should return does not exist search result for invalid keyword', (done) => {
      request(app)
        .get('/api/v1/user/roles/10948?search=keng')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.result.meta.search).toEqual('keng');
          if (err) return done(err);
          done();
        });
    });
  });

  describe('Update User Center', () => {
    describe('PATCH api/v1/center/user', () => {
      it('update the user center', (done) => {
        request(app)
          .patch('/api/v1/center/user')
          .set('authorization', token)
          .send({
            email: 'captan.ameria@andela.com',
            roleName: 'Travel Administrator',
            center: ['Nairobi, Kenya']
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(200);
            expect(res.body.message).toEqual('Centres updated successfully');
            done();
          });
      });

      it('return error if email does not', (done) => {
        request(app)
          .patch('/api/v1/center/user')
          .set('authorization', token)
          .send({
            email: 'cap@andela.com',
            roleName: 'Travel Administrator',
            center: ['Nairobi, Kenya']
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(404);
            expect(res.body.error).toEqual('Email does not exist');
            done();
          });
      });

      it('return error if center does not', (done) => {
        request(app)
          .patch('/api/v1/center/user')
          .set('authorization', token)
          .send({
            email: 'captan.ameria@andela.com',
            roleName: 'Travel Administrator',
            center: ['Togo']
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(404);
            expect(res.body.error).toEqual('Center does not exist -> Togo');
            done();
          });
      });

      it('return error if center is not an Array', (done) => {
        request(app)
          .patch('/api/v1/center/user')
          .set('authorization', token)
          .send({
            email: 'captan.ameria@andela.com',
            roleName: 'Travel Administrator',
            center: 'Togo'
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(400);
            expect(res.body.error).toEqual('Center must be an array and cannot be empty');
            done();
          });
      });

      it('return error if user dose not have the role', (done) => {
        request(app)
          .patch('/api/v1/center/user')
          .set('authorization', token)
          .send({
            email: 'captan.ameria@andela.com',
            roleName: 'Finance team member',
            center: 'Togo'
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(400);
            expect(res.body.error).toEqual('Center must be an array and cannot be empty');
            done();
          });
      });
    });
  });
});
