import supertest from 'supertest';
import axios from 'axios';
import StackTraceGPS from 'stacktrace-gps';
import requestMock from 'request';
import app from '../../../app';
import Utils from '../../../helpers/Utils';

const request = supertest(app);


const api = async data => request.post('/api/v1/errorBoundary').send(data);

const crashReportingUrl = 'https://crash_reporting_slack_hook_url';
process.env.CRASH_REPORTING_CHANNEL = crashReportingUrl;

jest.mock('request', () => jest.fn());
jest.mock('stacktrace-gps', () => jest.fn());


const mockRequest = response => (config, callback) => {
  if (response) {
    callback(undefined, response);
  } else {
    callback(new Error());
  }
};
requestMock.mockImplementation(mockRequest('Returned response'));

StackTraceGPS.mockImplementation(({ ajax }) => ({
  pinpoint: async () => {
    await ajax();
    return 'renderButtons()@/Users/git/Work/Apprenticeship/travel'
        + '_tool_front/src/views/VerificationDetails/index.jsx:237:0';
  }
}));


describe('ErrorBoundaryController', () => {
  const data = {
    stackTrace: [
      {
        fileName: 'file.min.js',
        lineNumber: 1,
        columnNumber: 2,
      },
      {
        fileName: 'file2.min.js',
        lineNumber: 1,
        columnNumber: 2,
      },
      {
        fileName: 'file3.min.js',
        lineNumber: 1,
        columnNumber: 2,
      }
    ],
    link: 'https://travela.andela.com/requests',
    stackTraceId: '123',
    info: {
      userAgent: 'Mozilla',
      message: 'location.includes is not a function'
    }
  };

  beforeEach(() => {
    global.crashReports = [];
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
        },
        {
          message: 'The error information is required',
          name: 'info'
        },
        ]
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
    expect(status).toEqual(400);
    expect(body).toMatchObject({
      success: false,
      message: 'Unable to send message to the slack channel'
    });
  });

  it('should allow an authenticated user to clear existing crash reports', async () => {
    const token = Utils.generateTestToken({
      UserInfo: {
        id: '-MUnaemKrxA90lPNQs1FOLNp',
        fullName: 'Kayode Okunlade',
        email: 'kayode.dev@andela.com',
        name: 'Kayode Okunlade',
        location: 'Kenya'
      }
    });
    await api(data);
    expect(global.crashReports.length).toEqual(1);

    await request.delete('/api/v1/errorBoundary/crashReports').set('Authorization', token).send();
    expect(global.crashReports.length).toEqual(0);
  });
});
