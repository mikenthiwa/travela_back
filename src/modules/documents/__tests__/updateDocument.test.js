import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import mockDocuments from './__mocks__/mockDocuments';
import { role } from '../../userRole/__tests__/mocks/mockData';

const request = supertest;
const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJpZCI6Ii1MSEptS3J4'; // eslint-disable-line

describe('Update Document', () => {
  const user = {
    id: '1000',
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  };

  const payload = {
    UserInfo: {
      id: '-MUyHJmKrxA90lPNQ1FOLNm',
      name: 'Samuel Kubai'
    }
  };

  const userRole = {
    userId: '10000',
    roleId: 401938,
  };

  const documentRequest = {
    name: 'Passport',
    cloudinary_public_id: 'assaassas',
    cloudinary_url: 'http://doc.com',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm'
  };

  beforeAll(async () => {
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.create(user);
    await models.UserRole.create(userRole);
    await models.Document.bulkCreate(mockDocuments);
  });

  afterAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });
  });

  const token = Utils.generateTestToken(payload);

  it('should return 401 status if token is not provided', (done) => {
    const expectedResponse = {
      status: 401,
      body: {
        success: false,
        error: 'Please provide a token'
      }
    };

    request(app)
      .put('/api/v1/documents/1')
      .send({ ...documentRequest })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });
  it('should return 401 status if token is invalid', (done) => {
    const expectedResponse = {
      status: 401,
      body: {
        success: false,
        error: 'Token is not valid'
      }
    };

    request(app)
      .put('/api/v1/documents/1')
      .send({ ...documentRequest })
      .set('authorization', invalidToken)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });

  it('should return 400 status if name starts with a number', (done) => {
    const expectedResponse = {
      status: 400,
      body: {
        success: false,
        error: 'Name is not valid!'
      }
    };

    request(app)
      .put('/api/v1/documents/1')
      .set('authorization', token)
      .send({
        ...documentRequest,
        name: 123
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });

  it('should return 400 status if name is just a single letter', (done) => {
    const expectedResponse = {
      status: 400,
      body: {
        success: false,
        error: 'Name is not valid!'
      }
    };

    request(app)
      .put('/api/v1/documents/1')
      .set('authorization', token)
      .send({
        ...documentRequest,
        name: 'y'
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });

  it('should return 400 status if name field is empty', (done) => {
    const expectedResponse = {
      status: 400,
      body: {
        success: false,
        error: 'Name field cannot be empty!'
      }
    };

    request(app)
      .put('/api/v1/documents/1')
      .set('authorization', token)
      .send({
        ...documentRequest,
        name: ''
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });

  it('should return 400 status if user already have a document with the name',
    (done) => {
      const expectedResponse = {
        status: 400,
        body: {
          success: false,
          error: 'You already have a document with name: \'visa\'!'
        }
      };

      request(app)
        .put('/api/v1/documents/1')
        .set('authorization', token)
        .send({
          ...documentRequest,
          name: 'visa'
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body).toMatchObject(expectedResponse.body);
          done();
        });
    });

  it('should return 404 status if document was not found', (done) => {
    const expectedResponse = {
      status: 404,
      body: {
        success: false,
        error: 'Document not found!'
      }
    };

    request(app)
      .put('/api/v1/documents/45tyu')
      .set('authorization', token)
      .send({
        ...documentRequest,
        name: 'Travel Stipend'
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });

  it('should update document name', (done) => {
    request(app)
      .put('/api/v1/documents/1')
      .set('authorization', token)
      .send({
        ...documentRequest,
        name: 'travel-Stipend01'
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toEqual('Document name updated successfully!');
        expect(res.body.document.name).toEqual('Travel-stipend01');
        done();
      });
  });
});
