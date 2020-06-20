import supertest from 'supertest';
import app from '../../../app';
import mockDocuments from './__mocks__/mockDocuments';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
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
  },
  {
    id: 20201,
    fullName: 'Ike Njoku',
    email: 'ike.njoku@andela.com',
    userId: '-MUyHJmKrxA90lPmyIdOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];

const userRoles = [{
  userId: 20200,
  roleId: 10948
},
{
  userId: 20201,
  roleId: 10948
}];

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    picture: 'fake.png'
  }
};

const payload2 = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPmyIdOLNm',
    fullName: 'Ike Njoku',
    email: 'ike.njoku@andela.com',
    picture: 'fake.png'
  }
};

const userWithDocuments = Utils.generateTestToken(payload);
const userWithoutDocuments = Utils.generateTestToken(payload2);


describe('Documents controller', () => {
  beforeAll(async () => {
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });

    process.env.DEFAULT_ADMIN = 'black.windows@andela.com';
    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRoles);
    await models.Document.bulkCreate(mockDocuments);
  });
  afterAll(async () => {
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });
  });
  describe('Fetch Document: GET /api/v1/documents', () => {
    it('should throw 404 if no document is found',
      (done) => {
        const expectedResponse = {
          status: 404,
          body: {
            success: false,
            error: 'No documents found'
          }
        };
        request
          .get('/api/v1/documents')
          .set('authorization', userWithoutDocuments)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toBe(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

    it('should fetch documents of signed in user',
      (done) => {
        const expectedResponse = {
          status: 200,
          body: {
            success: true,
            message: 'Successfully retrieved your documents',
            documents: mockDocuments
          }
        };
        request
          .get('/api/v1/documents')
          .set('authorization', userWithDocuments)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toBe(expectedResponse.status);
            expect(res.body.success).toBe(expectedResponse.body.success);
            expect(res.body.message).toBe(expectedResponse.body.message);
            expect(res.body.documents.length).toEqual(3);
            done();
          });
      });

    it('should search for documents of signed in user',
      (done) => {
        const expectedResponse = {
          status: 200,
          body: {
            success: true,
            message: 'Successfully retrieved your documents',
            documents: [{
              id: '2',
              name: 'visa',
              cloudinary_public_id: 'eDjweu4I236FvT',
              cloudinary_url: 'https://image.url',
              userId: '-MUyHJmKrxA90lPNQ1FOLNm',
              deletedAt: null,
              createdAt: '2018-11-07T04:33:06.288Z',
              updatedAt: '2018-11-07T04:34:06.288Z',
            }]
          }
        };
        request
          .get('/api/v1/documents?search=visa')
          .set('authorization', userWithDocuments)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toBe(expectedResponse.status);
            expect(res.body).toEqual(expectedResponse.body);
            done();
          });
      });
  });
});
