import request from 'supertest';
import mail from 'mailgun-js';
import models from '../../../database/models';
import { role as roles, token2, center } from './mocks/mockData';
import Utils from '../../../helpers/Utils';
import app from '../../../app';


const payload = {
  UserInfo: {
    id: 11001,
    name: 'Dave',
    fullName: 'Dave Mathews',
    email: 'this.requester@gmail.com',
    picture: 'profile.png',
    location: 'Lagos',
  }
};

const token = Utils.generateTestToken(payload);

const requester = {
  fullName: 'Dave Mathews',
  passportName: 'Dave Mathews Njeru',
  department: 'Talent & Development',
  occupation: 'Software developer',
  email: 'this.requester@gmail.com',
  userId: 'q-wKFo34sP',
  picture: 'profile.png',
  location: 'Lagos',
  gender: 'Male',
  roleId: 401938,
  id: 11001,
};

const locationTravelTeamMember = {
  fullName: 'Location TTM',
  passportName: 'Location Travel Team Member',
  department: 'Guest Relations & Travel',
  occupation: 'Travel Team Member',
  email: 'origin.TTM@gmail.com',
  userId: 'q-wKFo34sOTTM',
  picture: 'profile.png',
  location: 'Lagos',
  gender: 'Male',
  roleId: 339458,
  id: 2,
};
jest.mock('mailgun-js', () => ({
  messages: jest.fn()
}));


mail.messages.mockImplementation(() => ({
  send: jest.fn()
}));

global.io = {
  sockets: {
    emit: jest.fn((event, dataToEmit) => dataToEmit)
  }
};

describe('Mail Travel Members', () => {
  const cleanDBForUse = async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
  };
  beforeAll(async () => {
    await cleanDBForUse();
    await models.Role.bulkCreate(roles);
    await models.User.bulkCreate([requester, locationTravelTeamMember
    ]);
    await models.UserRole.create({
      userId: locationTravelTeamMember
        .id,
      roleId: locationTravelTeamMember
        .roleId,
      centerId: center[0].id,
    });
  });

  afterAll(async () => {
    await cleanDBForUse();
  });
  it('should return status 401 when token is invalid', (done) => {
    const url = '/api/v1/no-passport';
    request(app)
      .post(url)
      .set('Authorization', token2)
      .end((err, res) => {
        expect(res.status).toEqual(401);
        done();
      });
  });
  it('should return status 200 when token is valid', (done) => {
    const url = '/api/v1/no-passport';
    request(app)
      .post(url)
      .set('Authorization', token)
      .end((err, res) => {
        expect(res.status).toEqual(200);
        expect(res.body.success).toBeTruthy();
        done();
      });
  });
});
