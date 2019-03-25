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
    id: 's0m31d098',
    fullName: 'Tester user',
    name: 'Tester user',
    email: 'tester.user@andela.com',
    picture: 'fakePicture.png'
  },
};

const token = Utils.generateTestToken(payload);

describe('Update Budget Checker role test', () => {
  beforeAll(async () => {
    moxios.install();
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.Role.bulkCreate(role);
    await models.User.destroy({ truncate: true, cascade: true });
    await models.UserRole
      .destroy({ truncate: true, cascade: true });
    await models.UsersDepartments.destroy({ truncate: true, cascade: true });
    await models.Department.destroy({ truncate: true, cascade: true });
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.Center.bulkCreate(centers);
    await models.User.create({
      fullName: 'Tester user',
      passportName: 'Tester user',
      department: 'Talent & Development',
      occupation: 'Software developer',
      email: 'tester.user@andela.com',
      userId: 's0m31d098',
      picture: 'fakePicture.png',
      location: 'Lagos, Nigeria',
      manager: 'Tester user',
      gender: 'Male',
      id: 1,
    });
    await models.UserRole.bulkCreate([{
      userId: 1,
      roleId: 10948
    }, {
      userId: 1,
      roleId: 60000
    }]);
    await models.Department.create({
      id: 1,
      name: 'Test department'
    });
    await models.UsersDepartments.create({
      id: 1,
      userId: 1,
      departmentId: 1
    });
    process.env.DEFAULT_ADMIN = 'tester.user@andela.com';
  });

  afterAll(async () => {
    moxios.uninstall();
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.UsersDepartments.destroy({ truncate: true, cascade: true });
    await models.Department.destroy({ truncate: true, cascade: true });
    await models.Center.destroy({ truncate: true, cascade: true });
  });

  describe('Authenticated user', () => {
    it('should return error if department is not given when editing a budget checker',
      (done) => {
        request(app)
          .patch('/api/v1/user/roles/budgetChecker')
          .set('authorization', token)
          .send({
            email: 'test.user@andela.com',
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
          .patch('/api/v1/user/roles/budgetChecker')
          .set('authorization', token)
          .send({
            email: 'test.user@andela.com',
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

    it('throws 404 error if the user does not exist',
      (done) => {
        request(app)
          .patch('/api/v1/user/roles/budgetChecker')
          .set('authorization', token)
          .send({
            email: 'no.user@andela.com',
            departments: ['Fellow']
          })
          .expect(404)
          .end((err, res) => {
            expect(res.body.success).toEqual(false);
            expect(res.body.error)
              .toEqual('User does not exist');
            done();
          });
      });

    it('should update budget checker role',
      (done) => {
        request(app)
          .patch('/api/v1/user/roles/budgetChecker')
          .set('authorization', token)
          .send({
            email: 'tester.user@andela.com',
            departments: ['Fellow', 'staff']
          })
          .expect(200)
          .end((err, res) => {
            expect(res.body.success).toEqual(true);
            expect(res.body.budgetCheckerDepartments.length).toBe(2);
            expect(res.body.budgetCheckerDepartments[0].name).toEqual('Fellow');
            expect(res.body.budgetCheckerDepartments[1].name).toEqual('Staff');
            expect(res.body.message)
              .toEqual('Budget checker role updated successfully');
            done();
          });
      });
  });

  it('should not asign a budget checker duplicate departments',
    (done) => {
      request(app)
        .patch('/api/v1/user/roles/budgetChecker')
        .set('authorization', token)
        .send({
          email: 'tester.user@andela.com',
          departments: ['Fellow', 'fellow']
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message)
            .toEqual('Budget checker role updated successfully');
          expect(res.body.budgetCheckerDepartments.length).toBe(1);
          expect(res.body.budgetCheckerDepartments[0].name).toEqual('Fellow');
          done();
        });
    });

  it(`should remove budget checker from a department if it
    is not part of the departments submitted`,
  (done) => {
    request(app)
      .patch('/api/v1/user/roles/budgetChecker')
      .set('authorization', token)
      .send({
        email: 'tester.user@andela.com',
        departments: ['Fellow']
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message)
          .toEqual('Budget checker role updated successfully');
        expect(res.body.budgetCheckerDepartments.length).toBe(1);
        expect(res.body.budgetCheckerDepartments[0].name).toEqual('Fellow');
        done();
      });
  });

  it('throws 409 error if the user is not a budget checker',
    async (done) => {
      await models.UserRole.destroy({
        where: {
          userId: 1,
          roleId: 60000
        }
      });
      request(app)
        .patch('/api/v1/user/roles/budgetChecker')
        .set('authorization', token)
        .send({
          email: 'tester.user@andela.com',
          departments: ['Fellow']
        })
        .expect(404)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.error)
            .toEqual('User is not a budget checker');
          done();
        });
    });
});
