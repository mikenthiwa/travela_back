import request from 'supertest';
import moxios from 'moxios';
import app from '../../../app';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import {
  role,
} from './mocks/mockData';

const payload = {
  UserInfo: {
    userId: '-MUyHJmKrxA90lPivgsvdgdvNQ1FOLNm',
    fullName: 'captain america',
    name: 'captain america',
    email: 'user1.america@andela.com',
    picture: 'fake.png'
  },
};

const userRoles = [{
  userId: 3000,
  roleId: 29187
}, {
  userId: 4000,
  roleId: 29187
}];

const userMock = [
  {
    id: 3000,
    fullName: 'User1 america',
    userId: '-MUyHJmKrxA90lPivgsvdgdvNQ1FOLNm',
    location: 'Lagos, Nigeria',
    name: 'captain america',
    email: 'user1.america@andela.com',
    picture: 'fake.png'
  },
  {
    id: 4000,
    fullName: 'User2 america',
    userId: '-MUyHJmKrxA90lTTTTTTTTgdvNQ1FOLNm',
    location: 'Lagos, Nigeria',
    name: 'captain america',
    email: 'user2.america@andela.com',
    picture: 'fake.png'
  },
];

const token = Utils.generateTestToken(payload);


describe('User Roles Pagination', () => {
  beforeAll(async () => {
    moxios.install();
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    process.env.DEFAULT_ADMIN = 'user1.america@andela.com';
    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRoles);
  });

  afterAll(async () => {
    moxios.uninstall();
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  });

  it('should return a paginted list of user role', (done) => {
    request(app)
      .get('/api/v1/user/roles/29187')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        const {
          result: {
            users,
            meta: {
              count,
              currentPage,
              pageCount,
            },
          }
        } = res.body;
        expect(res.body.success).toEqual(true);
        expect(count).toEqual(2);
        expect(currentPage).toEqual(1);
        expect(pageCount).toEqual(1);
        expect(users.length).toEqual(2);
        if (err) return done(err);
        done();
      });
  });

  it('should return a second page of the paginted list of user role', (done) => {
    request(app)
      .get('/api/v1/user/roles/29187?page=2&limit=10')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        const {
          result: {
            users,
            meta: {
              count,
              currentPage,
              pageCount,
            },
          }
        } = res.body;
        expect(res.body.success).toEqual(true);
        expect(count).toEqual(2);
        expect(currentPage).toEqual(2);
        expect(pageCount).toEqual(1);
        expect(users.length).toEqual(0);
        if (err) return done(err);
        done();
      });
  });

  it('should return role does not exist when inavlid roleId is provided', (done) => {
    request(app)
      .get('/api/v1/user/roles/1')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(404)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Role does not exist');
        if (err) return done(err);
        done();
      });
  });

  it('should not paginate user roles when `allPage` is true', (done) => {
    request(app)
      .get('/api/v1/user/roles/29187?page=1&limit=1&allPage=true')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        const {
          result: {
            users,
            meta: {
              count,
            },
          }
        } = res.body;
        expect(res.body.success).toEqual(true);
        expect(count).toEqual(users.length);
        if (err) return done(err);
        done();
      });
  });

  it('should return role does not exist when inavlid roleId is provided', (done) => {
    request(app)
      .get('/api/v1/user/roles/29187?page=1&limit=1&allPage=all')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(400)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('param allPage is optional and should be true');
        if (err) return done(err);
        done();
      });
  });
});
