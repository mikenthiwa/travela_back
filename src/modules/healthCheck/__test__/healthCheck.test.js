import request from 'supertest';
import app from '../../../app';

describe('User Role Test', () => {
  it('should return 200 _healthz check', (done) => {
    request(app)
      .get('/api/v1/_healthz')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).toEqual('Welcome to Travel Tool');
        done();
      });
  });
});
