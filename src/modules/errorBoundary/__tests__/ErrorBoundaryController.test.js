import supertest from 'supertest';
import axios from 'axios';
import app from '../../../app';

const request = supertest(app);


const api = async data => request.post('/api/v1/errorBoundary').send(data);

const crashReportingUrl = 'https://crash_reporting_slack_hook_url';
process.env.CRASH_REPORTING_CHANNEL = crashReportingUrl;

describe('ErrorBoundaryController', () => {
  const data = {
    stackTrace: 'something',
    link: 'https://travela.andela.com/requests',
    stackTraceId: '123'
  };

  beforeEach(() => {
    global.crashReports = [];
  });

  beforeAll(() => {
    // mock axios
    axios.post = jest.fn();
    axios.post.mockImplementation(() => new Promise((resolve => resolve('ok'))));
  });

  afterAll(() => {

  });

  it('checks the parameters required for generating a crash report', async () => {
    const { status, body } = await api({});
    expect(status).toEqual(422);
    expect(body).toMatchObject({
      success: false,
      message: 'Validation failed',
      errors:
        [{
          message: 'The browser location link cannot be empty',
          name: 'link'
        },
        {
          message: 'The stack trace is required',
          name: 'stackTrace'
        },
        {
          message: 'The stack trace id is required',
          name: 'stackTraceId'
        }]
    });
  });

  it('should not allow duplicate stack traces', async () => {
    await api(data);
    const { body, status } = await api(data);
    expect(status).toEqual(409);
    expect(body).toMatchObject({
      success: false,
      message: 'This error has already been reported.'
    });
  });

  it('should throw an error if error reporting channel has not been set', async () => {
    delete process.env.CRASH_REPORTING_CHANNEL;
    const { body, status } = await api(data);
    expect(status).toEqual(400);
    expect(body).toMatchObject({
      success: false,
      message: 'Crash reporting slack channel is not provided'
    });

    process.env.CRASH_REPORTING_CHANNEL = crashReportingUrl;
  });

  it('should throw an error if an error occurs posting to the slack channel', async () => {
    axios.post.mockImplementation(() => new Promise((resolve, reject) => reject(
      new Error('invalid something')
    )));
    const { body, status } = await api(data);
    expect(status).toEqual(401);
    expect(body).toMatchObject({
      success: false,
      message: 'Unable to send message to the slack channel'
    });
  });
});
