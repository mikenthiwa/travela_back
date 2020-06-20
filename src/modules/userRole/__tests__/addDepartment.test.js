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

const testUser = [{
  id: 79874134,
  userId: 'wer45660+++',
  fullName: 'test user',
  location: 'Nairobi, Kenya',
  name: 'test user',
  email: 'test.user@andela.com',
  picture: 'fakePicture.png'
}];

const testUserRoles = [{
  userId: 79874134,
  roleId: 10948
}];

const token = Utils.generateTestToken(payload);

describe('Budget Checker role test', () => {
  beforeAll(async (done) => {
    moxios.install();
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.Role.bulkCreate(role);
    await models.User.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.Center.bulkCreate(centers);
    await models.User.bulkCreate(testUser);
    await models.UserRole.bulkCreate(testUserRoles);
    process.env.DEFAULT_ADMIN = 'test.user@andela.com';

    done();
  });

  afterAll(async () => {
    moxios.uninstall();
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.Center.destroy({ truncate: true, cascade: true });
  });


  describe('Authenticated user', () => {
    it('should return error if department is not given when adding a budget checker',
      (done) => {
        request(app)
          .put('/api/v1/user/role/update')
          .set('authorization', token)
          .send({
            email: 'test.user@andela.com',
            roleName: 'Budget Checker',
          })
          .expect(400)
          .end((err, res) => {
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('Department must be an array and cannot be empty');
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
          .expect(400)
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
