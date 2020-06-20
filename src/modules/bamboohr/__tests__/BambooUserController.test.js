import supertest from 'supertest';
import app from '../../../app';

const request = supertest(app);

process.env.BAMBOOHR_SECRET_KEY = 'test';

describe('Bamboo User controller', () => {
  describe('POST /bamboohr/user/:key', () => {
    it('Create a user from bamboohr', async (done) => {
      request.post('/api/v1/bamboohr/user/test')
        .send({
          employees: [{ id: 1036 }]
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Successfully created or updated the user');
          done();
        });
    });
    it('Update a user from bamboohr', async (done) => {
      request.post('/api/v1/bamboohr/user/test')
        .send({
          employees: [{ id: 1036 }]
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Successfully created or updated the user');
          done();
        });
    });
    it('Create a user from bamboohr with secret key no employee key', async (done) => {
      request.post('/api/v1/bamboohr/user/test')
        .send({
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Validation failed');
          expect(res.body.errors[0].message).toEqual('There is no employee data');
          expect(res.body.errors[0].name).toEqual('employees');
          done();
        });
    });
    it('Create a user from bamboohr with secret key no employee data', async (done) => {
      request.post('/api/v1/bamboohr/user/test')
        .send({
          employees: []
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Validation failed');
          expect(res.body.errors[0].message).toEqual('There is no employee data');
          expect(res.body.errors[0].name).toEqual('employees');
          done();
        });
    });
  });
});
