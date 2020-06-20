import Error from '../Error';

describe('Error: unit test', () => {
  let json, status, statusCode, response, error; // eslint-disable-line

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn(() => ({ json }));
    response = { status };
    statusCode = 404;
    error = 'Error';
  });

  it('returns correct error message', () => {
    expect.assertions(2);
    Error.handleError(error, statusCode, response);
    expect(json).toHaveBeenCalledTimes(1);
    expect(json).toHaveBeenCalledWith({ success: false, error });
  });

  it('returns the correct status code', () => {
    expect.assertions(2);
    Error.handleError(error, statusCode, response);
    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(404);
  });
});
