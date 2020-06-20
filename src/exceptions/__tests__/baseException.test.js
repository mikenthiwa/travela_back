import assert from 'assert';

import BaseException from '../baseException';
import TravelCalendarError from '../travelCalendarExceptions';

describe('Base Exception', () => {
  const throwException = (type, message, status) => {
    switch (type) {
      case 'base':
        throw new BaseException(message, status);
      case 'travel calendar':
        throw new TravelCalendarError(message, status);
      default:
    }
  };

  it('catches customized exception and status', () => {
    try {
      throwException('base', 'System error', 500);
    } catch (error) {
      assert.equal(error.message, 'System error');
      assert.equal(500, error.status);
    }
  });
  it('should catch default error', () => {
    try {
      throwException('base', '', undefined);
    } catch (error) {
      assert.equal('', error.message);
      assert.equal(500, error.status);
    }
  });
  it('should catch TravelCalendarError custom exception and status', () => {
    try {
      throwException('travel calendar', 'No record found', 404);
    } catch (err) {
      assert.equal(err.message, 'No record found');
      assert.equal(404, err.status);
    }
  });
  it('should catch TravelCalendarError default exception and status', () => {
    try {
      throwException('travel calendar', '', undefined);
    } catch (err) {
      assert.equal(err.message, 'Travel Calendar Error');
      assert.equal(500, err.status);
    }
  });
});
