import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import mockData from './mocks/mocksData';
import { role } from '../../userRole/__tests__/mocks/mockData';
import CommentsController from '../CommentsController';

global.io = {
  sockets: {
    emit: (event, dataToEmit) => dataToEmit
  }
};

CommentsController.sendEmail = jest.fn();

const request = supertest(app);
const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    picture: 'fakepicture.png',
    roleid: 53019
  }
};
const otherUser = {
  UserInfo: {
    id: '-MUnaemKrxA90lPNQ1FOLNm',
    name: 'Dark Knight',
    email: 'dark.knight@andela.com',
    picture: 'fakepicture.png',
    roleid: 53019
  }
};
const token = Utils.generateTestToken(payload);
const otherUsertoken = Utils.generateTestToken(otherUser);
const invalidToken = 'eyJhbGciOiJSUzI1NiIsXVCJ9.eyJVc2VySW5mbyI6eyJpZ';
describe('Comments controller', () => {
  beforeAll(async (done) => {
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.Role.bulkCreate(role);
    await models.User.destroy({ truncate: true, cascade: true });
    await models.User.create(mockData.userMock);
    await models.Request.bulkCreate(mockData.requestsMock);
    await models.TravelReadinessDocuments.destroy({ truncate: true, cascade: true });
    await models.TravelReadinessDocuments.create(mockData.documentMock);
    request
      .get('/api/v1/user')
      .send(mockData.userMock)
      .end((err) => {
        if (err) done(err);
        done();
      });
  });
  afterAll(async () => {
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.Request.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.Comment.destroy({ truncate: true, cascade: true });
    await models.TravelReadinessDocuments.destroy({ truncate: true, cascade: true });
  });
  describe('Unauthenticated user', () => {
    it('should throw 401 error if the user does not provide a token',
      (done) => {
        const expectedResponse = {
          status: 401,
          body: {
            success: false,
            error: 'Please provide a token'
          }
        };
        request.post('/api/v1/comments')
          .send({
            comment: "I thought we agreed you'd spend only two weeks",
            requestId: '-ss60B42oZ-invalid'
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });
    it("should throw 401 error if the user's provides an invalid token",
      (done) => {
        const expectedResponse = {
          status: 401,
          body: {
            success: false,
            error: 'Token is not valid'
          }
        };
        request
          .post('/api/v1/comments')
          .set('authorization', invalidToken)
          .end((err, res) => {
            if (err) done(err);
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });
  });
  describe('Authenticated User', () => {
    describe('POST api/v1/comments', () => {
      it('throws 404 if the requestId does not match', (done) => {
        const expectedResponse = {
          success: false,
          error: 'Request does not exist'
        };
        request
          .post('/api/v1/comments')
          .set('authorization', token)
          .send({
            comment: "I thought we agreed you'd spend only two weeks",
            requestId: '-ss60B42oZ-invalid'
          })
          .end((err, response) => {
            if (err) done(err);
            expect(response.statusCode).toEqual(404);
            expect(response.body).toEqual(expectedResponse);
            done();
          });
      });

      it('throws 404 if the documentId does not match', (done) => {
        const expectedResponse = {
          success: false,
          error: 'Request does not exist'
        };
        request
          .post('/api/v1/comments')
          .set('authorization', token)
          .send({
            comment: "I thought we agreed you'd spend only two weeks",
            documentId: '-ss60B42oZ-invalid'
          })
          .end((err, response) => {
            if (err) done(err);
            expect(response.statusCode).toEqual(404);
            expect(response.body).toEqual(expectedResponse);
            done();
          });
      });

      it('returns 201 and creates a new comment', (done) => {
        const expectedResponse = {
          success: true,
          message: 'Comment created successfully',
          comment: {
            comment: "I thought we agreed you'd spend only two weeks",
            requestId: '-ss60B42oZ-a',
            userId: 10
          }
        };
        request
          .post('/api/v1/comments')
          .set('authorization', token)
          .send({
            comment: "I thought we agreed you'd spend only two weeks",
            requestId: '-ss60B42oZ-a'
          })
          .end((err, res) => {
            if (err) done(err);
            const {
              comment, requestId,
            } = res.body.comment;
            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toEqual(expectedResponse.message);
            expect(comment).toEqual(expectedResponse.comment.comment);
            expect(requestId).toEqual(expectedResponse.comment.requestId);
            done();
          });
      });

      it('returns 201 and creates a new comment for a document', (done) => {
        const expectedResponse = {
          success: true,
          message: 'Comment created successfully',
          comment: {
            comment: "I thought we agreed you'd spend only two weeks",
            documentId: 'ss60B42oZd',
            userId: 10
          }
        };
        request
          .post('/api/v1/comments')
          .set('authorization', token)
          .send({
            comment: "I thought we agreed you'd spend only two weeks",
            documentId: 'ss60B42oZd',
          })
          .end((err, res) => {
            if (err) done(err);
            const {
              comment, documentId
            } = res.body.comment;
            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toEqual(expectedResponse.message);
            expect(comment).toEqual(expectedResponse.comment.comment);
            expect(documentId).toEqual(expectedResponse.comment.documentId);
            done();
          });
      });
    });
    describe('PUT api/v1/comments/:id', () => {
      beforeAll(async () => {
        await models.Comment.destroy({ truncate: true, cascade: true });
        await models.Comment.create(mockData.commentMock);
        await models.Comment.create(mockData.commentMockDocument);
      });
      it('throws 404 if the requestId does not match', (done) => {
        const expectedResponse = {
          success: false,
          error: 'Request does not exist'
        };
        request
          .put('/api/v1/comments/1')
          .set('authorization', token)
          .send({
            comment: "I thought we agreed you'd spend only two weeks",
            requestId: '-ss60B42oZ-invalid',
          })
          .end((err, response) => {
            if (err) done(err);
            expect(response.statusCode).toEqual(404);
            expect(response.body).toEqual(expectedResponse);
            done();
          });
      });
      it('throws 404 if the commentId does not match', (done) => {
        const expectedResponse = {
          success: false,
          error: 'Comment does not exist'
        };
        request
          .put('/api/v1/comments/5')
          .set('authorization', token)
          .send({
            requestId: '-ss60B42oZ-a',
            comment: "I thought we agreed you'd spend only one week",
          })
          .end((err, response) => {
            if (err) done(err);
            expect(response.statusCode).toEqual(404);
            expect(response.body).toEqual(expectedResponse);
            done();
          });
      });
      it('returns 200 and updates a comment', (done) => {
        const { id } = mockData.commentMock;

        request
          .put(`/api/v1/comments/${id}`)
          .set('authorization', token)
          .send({
            requestId: '-ss60B42oZ-a',
            comment: "I thought we agreed you'd spend only one week",
          })
          .end((err, response) => {
            if (err) done(err);
            expect(response.statusCode).toEqual(200);
            done();
          });
      });
      it('returns 200 and updates a comment for a document', (done) => {
        const { id } = mockData.commentMockDocument;
        request
          .put(`/api/v1/comments/${id}`)
          .set('authorization', token)
          .send({
            requestId: 'ss60B42oZd',
            comment: "I thought we agreed you'd spend only one week doc",
          })
          .end((err, response) => {
            if (err) done(err);
            expect(response.statusCode).toEqual(200);
            done();
          });
      });
    });
    describe('DELETE api/v1/comments/:id', () => {
      const { id } = mockData.commentMock;
      it('throws 404 if the commentId is not found', async (done) => {
        const expectedResponse = {
          success: false,
          error: 'Comment does not exist'
        };
        const response = await request
          .delete('/api/v1/comments/666')
          .set('authorization', token);
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual(expectedResponse);
        done();
      });
      it('throws 401 if comment was created by a different user', async (done) => {
        await models.User.create(mockData.otherUserMock);
        const expectedResponse = {
          success: false,
          message: 'You are not allowed to delete this comment',
        };
        const response = await request
          .delete(`/api/v1/comments/${id}`)
          .set('authorization', otherUsertoken);
        expect(response.statusCode).toEqual(401);
        expect(response.body).toEqual(expectedResponse);
        done();
      });
      it('returns 200 and deletes a comment', async (done) => {
        const expectedResponse = {
          success: true,
          message: 'Comment deleted successfully',
        };
        const response = await request
          .delete(`/api/v1/comments/${id}`)
          .set('authorization', token);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual(expectedResponse);
        done();
      });
    });
  });
});
