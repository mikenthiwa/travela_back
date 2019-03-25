import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import { role } from '../../userRole/__tests__/mocks/mockData';

const request = supertest(app);

const userMock = [
  {
    id: 20200,
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];

const userRoles = [
  {
    id: 1,
    userId: 20200,
    roleId: 60000,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
  {
    id: 2,
    userId: 20200,
    roleId: 10948,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
];

const DepartmentMock = [
  {
    id: 1,
    name: 'Success',
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  },
  {
    id: 2,
    name: 'Fellowship-Programs',
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  }
];

const UsersDepartmentsMock = [
  {
    id: 1,
    userId: 20200,
    departmentId: 1,
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  },
  {
    id: 1,
    userId: 20200,
    departmentId: 2,
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  }
];


const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    picture: 'fake.png'
  }
};

const superAdminToken = Utils.generateTestToken(payload);

describe('Department Controller', () => {
  beforeAll(async () => {
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Department.destroy({ force: true, truncate: { cascade: true } });

    process.env.DEFAULT_ADMIN = 'black.windows@andela.com';
    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRoles);
    await models.Department.bulkCreate(DepartmentMock);
    await models.UsersDepartments.bulkCreate(UsersDepartmentsMock);
  });
  afterAll(async () => {
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Department.destroy({ force: true, truncate: { cascade: true } });
  });

  it('should create a department successfully',
    (done) => {
      request
        .post('/api/v1/department')
        .set('authorization', superAdminToken)
        .send({ name: 'Fellow Staff' })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Successfully created a new Department');
          done();
        });
    });

  it('should get list of department successfully',
    (done) => {
      request
        .get('/api/v1/departments')
        .set('authorization', superAdminToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Department List');
          done();
        });
    });

  it('should return validation error when no department is provided',
    (done) => {
      request
        .post('/api/v1/department')
        .set('authorization', superAdminToken)
        .send({ name: '' })
        .expect(422)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message).toEqual('Validation failed');
          done();
        });
    });

  it('should remove department when user is deleted from role of budget checker',
    (done) => {
      request
        .delete('/api/v1/user/roles/20200/60000')
        .set('authorization', superAdminToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(true);
          done();
        });
    });
});
