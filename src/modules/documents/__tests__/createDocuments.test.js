import supertest from 'supertest';
import app from '../../../app';
import mockDocuments from './__mocks__/mockDocuments';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';

const request = supertest;
const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJpZCI6Ii1MSEptS3J4'; // eslint-disable-line

describe('Create Document', () => {
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

  const token = Utils.generateTestToken(payload);

  const documentRequest = {
    name: 'Work Permit',
    cloudinary_public_id: 'assaassas',
    cloudinary_url: 'http://doc.com'
  };

  beforeAll(async () => {
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.create(user);
    await models.Document.bulkCreate(mockDocuments);
  });

  afterAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Document.destroy({ force: true, truncate: { cascade: true } });
  });


  it('should return 401 status if token is not provided', (done) => {
    const expectedResponse = {
      status: 401,
      body: {
        success: false,
        error: 'Please provide a token'
      }
    };

    request(app)
      .post('/api/v1/documents')
      .send({ name: 'Travel Stipend' })
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
      .post('/api/v1/documents')
      .send({ name: 'Travel Stipend' })
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
      .post('/api/v1/documents')
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

  it('should return 400 status if cloudinary_public_id is empty', (done) => {
    const expectedResponse = {
      status: 400,
      body: {
        success: false,
        error: 'cloudinary_public_id is not valid'
      }
    };

    request(app)
      .post('/api/v1/documents')
      .set('authorization', token)
      .send({
        ...documentRequest,
        cloudinary_public_id: ''
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        done();
      });
  });

  it('should return 400 status if cloudinary_public_id is less that 3 characters', (done) => {
    const expectedResponse = {
      status: 400,
      body: {
        success: false,
        error: 'cloudinary_public_id is not valid'
      }
    };

    request(app)
      .post('/api/v1/documents')
      .set('authorization', token)
      .send({
        ...documentRequest,
        cloudinary_public_id: 'Ad'
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
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
      .post('/api/v1/documents')
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
      .post('/api/v1/documents')
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

  it('should return 400 status if cloudinary_url is empty', (done) => {
    const expectedResponse = {
      status: 400,
      body: {
        success: false,
        error: 'cloudinary_url is not a valid url'
      }
    };
 
    request(app)
      .post('/api/v1/documents')
      .set('authorization', token)
      .send({
        ...documentRequest,
        cloudinary_url: ''
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        done();
      });
  });

  
  it('should create document', (done) => {
    request(app)
      .post('/api/v1/documents')
      .set('authorization', token)
      .send({ ...documentRequest })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toEqual('Document uploaded successfully');
        done();
      });
  });

  it('should return 400 status if user already have a document with the name',
    (done) => {
      const expectedResponse = {
        status: 400,
        body: {
          success: false,
          error: 'You already have a document with name: \'work permit\'!'
        }
      };
  
      request(app)
        .post('/api/v1/documents')
        .set('authorization', token)
        .send({
          ...documentRequest
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body).toMatchObject(expectedResponse.body);
          done();
        });
    });
});
