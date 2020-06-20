import request from 'supertest';
import moxios from 'moxios';
import app from '../../../app';
import {
  postGuestHouse, postGuestHouse2, postGuestHouse3, postGuestHouse4
} from './mocks/guestHouseData';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import { role } from '../../userRole/__tests__/mocks/mockData';

const testUser = [{
  id: 292129,
  userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  fullName: 'John Snow',
  email: 'john.snow@andela.com',
  name: 'John Snow',
  picture: '',
  location: 'Kigali, Rwanda',
  createdAt: new Date(),
  updatedAt: new Date()
}];

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'John Snow',
    name: 'John Snow',
    email: 'john.snow@andela.com',
    picture: 'fakePicture.png'
  },
};
const nonExistingUserPayload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNms',
    fullName: 'John Snows',
    name: 'John Snows',
    email: 'john.snows@andela.com',
    picture: 'fakePicture.png'
  },
};

const token = Utils.generateTestToken(payload);
const nonExistingUserToken = Utils.generateTestToken(nonExistingUserPayload);
describe('Guest Role Test', () => {
  beforeAll(async (done) => {
    moxios.install();
    await models.Role.sync({ force: true });
    await models.Role.bulkCreate(role);
    await models.User.sync({ force: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.bulkCreate(testUser);
    process.env.DEFAULT_ADMIN = 'john.snow@andela.com';
    done();
  });
  afterAll(async (done) => {
    moxios.uninstall();
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    done();
  });
  it('should not save a new guest house if user does not exist', (done) => {
    request(app)
      .post('/api/v1/guesthouses')
      .set('Content-Type', 'application/json')
      .set('authorization', nonExistingUserToken)
      .send(postGuestHouse)
      .expect(400)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message)
          .toEqual('You are not signed in to the application');
        if (err) return done(err);
        done();
      });
  });

  it('should not add new guest house if user is not a travel admin', (done) => {
    request(app)
      .post('/api/v1/guesthouses')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(postGuestHouse)
      .expect(403)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('You don\'t have access to perform this action');
        if (err) return done(err);
        done();
      });
  });

  it('should change user to admin', (done) => {
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
  it('should not add new guest house if image is not url', (done) => {
    request(app)
      .post('/api/v1/guesthouses')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(postGuestHouse2)
      .expect(400)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Only Url allowed for Image');
        if (err) return done(err);
        done();
      });
  });

  it('should add a new guest house to the database', (done) => {
    request(app)
      .post('/api/v1/guesthouses')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(postGuestHouse)
      .expect(201)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Guest House created successfully');
        if (err) return done(err);
        done();
      });
  });

  it('should not add a new guest house to the database if genderPolicy is missing', (done) => {
    request(app)
      .post('/api/v1/guesthouses')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(postGuestHouse3)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.errors).toEqual([
          {
            message: 'Gender Policy is required',
            name: 'genderPolicy'
          }
        ]);
        if (err) return done(err);
        done();
      });
  });

  it('should not add a new guest house to the database if genderPolicy is not unisex, male or female', (done) => {
    request(app)
      .post('/api/v1/guesthouses')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(postGuestHouse4)
      .expect(400)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Gender policy should be either unisex, male or female');
        if (err) return done(err);
        done();
      });
  });
});

describe('Guest Rooms - GET', () => {
  it('should not get bed if gender is not provided', (done) => {
    request(app)
      .get('/api/v1/availablerooms?location=Lagos&departureDate=2018-12-12')
      .set('authorization', token)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.errors)
          .toEqual([
            {
              message: 'The gender is required',
              name: 'gender'
            },
            {
              message: 'The arrival date is required',
              name: 'arrivalDate'
            },
          ]);
        if (err) return done(err);
        done();
      });
  });

  it('should not get bed if location is not provided', (done) => {
    request(app)
      .get('/api/v1/availablerooms?gender=Male&departureDate=2018-12-12')
      .set('authorization', token)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.errors)
          .toEqual([
            {
              message: 'The location is required',
              name: 'location'
            },
            {
              message: 'The arrival date is required',
              name: 'arrivalDate'
            },
          ]);
        if (err) return done(err);
        done();
      });
  });

  it('should not get bed if departureDate is not provided', (done) => {
    request(app)
      .get('/api/v1/availablerooms?location=Lagos&gender=Male')
      .set('authorization', token)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.errors)
          .toEqual([
            {
              message: 'The departure date is required',
              name: 'departureDate'
            },
            {
              message: 'The arrival date is required',
              name: 'arrivalDate'
            },
          ]);
        if (err) return done(err);
        done();
      });
  });

  it('should not get bed if departureDate is invalid', (done) => {
    request(app)
      .get('/api/v1/availablerooms?location=Lagos&gender=Male&departureDate=67-23-12')
      .set('authorization', token)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.errors)
          .toEqual([
            {
              message: 'The arrival date is required',
              name: 'arrivalDate'
            },
            {
              message: 'The departure date is invalid',
              name: 'departureDate'
            }
          ]);
        if (err) return done(err);
        done();
      });
  });

  it('should not get bed if arrivalDate is invalid', (done) => {
    request(app)
      .get('/api/v1/availablerooms?location=Lagos&gender=Male&departureDate=2018-12-12&arrivalDate=98-22-22')
      .set('authorization', token)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.errors)
          .toEqual([
            {
              message: 'The arrival date is invalid',
              name: 'arrivalDate'
            },
            {
              message: 'Departure date should be less than arrival date.',
              name: 'departureDate'
            }
          ]);
        if (err) return done(err);
        done();
      });
  });

  it('should get beds if all fields are valid', (done) => {
    request(app)
      .get('/api/v1/availablerooms?location=Lagos&gender=Male&departureDate=2018-12-12&arrivalDate=2018-12-22')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message)
          .toEqual('Available rooms fetched');
        if (err) return done(err);
        done();
      });
  });

  it('should not get bed if departureDate is greater than arrivalDate', (done) => {
    request(app)
      .get('/api/v1/availablerooms?location=Lagos&gender=Male&departureDate=2018-12-23&arrivalDate=2018-12-22')
      .set('authorization', token)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.errors)
          .toEqual([
            {
              message: 'Departure date should be less than arrival date.',
              name: 'departureDate'
            }
          ]);
        if (err) return done(err);
        done();
      });
  });
});
