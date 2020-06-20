/* eslint-disable */
import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import documents from './__mocks__/deleteDocumentMock';
import { role } from '../../userRole/__tests__/mocks/mockData';

const request = supertest;

const payload = {
  UserInfo: {
    id: '--MUyHJmKrxA90lPNQ1FOLNm',
    email: 'ninja.lord@andela.com',
    name: 'Samuel Kubai',
    location: 'Lagos'
  },
};

const invalidTokenPayload = {
  UserInfo: {
    fullName: 'Arambe Doe',
    email: 'captan.isthmus@andela.com',
    userId: '--MUyHdxA90lPNQ1FOLN2',
  }
};

const userMock = [
  {
    id: 40000,
    fullName: 'Samuel Kubai',
    email: 'ninja.lord@andela.com',
    userId: '--MUyHJmKrxA90lPNQ1FOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 40001,
    fullName: 'Document ninja',
    email: 'doc.ninja@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];

const userRole = [{
  userId: 40000,
  roleId: 29187
}, {
  userId: 40001,
  roleId: 401938
}];


const token = Utils.generateTestToken(payload);
const anotherUserToken =  Utils.generateTestToken(invalidTokenPayload);
const invalidToken =  'eyJhbGciOiJSUzI1Ni6IkpXVCJ9.eyJVc2CI6Ii1MSEptS3J4';

describe('Travel ChecklistController', () => {
  beforeAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRole);
    await models.Document.bulkCreate(documents);
  });

  afterAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });
  });

  describe('Delete /api/v1/documents/:documentId', () => {
    it('should successfully delete a document',
    async () => {
      const response = await request(app)
        .delete('/api/v1/documents/1')
        .set('authorization', token)
        expect(response.body.message).toEqual('Document deleted successfully');
        expect(response.body.success).toEqual(true);
        expect(response.body.deletedDocument).toBeInstanceOf(Object);
    });

    it('should return an error for a non available document',
    async () => {
      const response = await request(app)
        .delete('/api/v1/documents/100')
        .set('authorization', token)
        expect(response.body.message).toEqual('Document not found');
        expect(response.body.success).toEqual(false);
    });

    it('should return an error for an already deleted document',
    async () => {
      const response = await request(app)
        .delete('/api/v1/documents/1')
        .set('authorization', token)
        expect(response.body.message).toEqual('Document not found');
        expect(response.body.success).toEqual(false);
    });

    it('should return an error if the token is invalid',
    async () => {
      const response = await request(app)
        .delete('/api/v1/documents/3')
        .set('authorization', invalidToken)
        expect(response.body.error)
          .toEqual('Token is not valid');
    });

    it('should return an error if the logged-in user have no document available',
    async () => {
      const response = await request(app)
        .delete('/api/v1/documents/3')
        .set('authorization', anotherUserToken)
        expect(response.body.message)
          .toEqual('Document not found');
        expect(response.status)
          .toEqual(404);
    });
  });
});