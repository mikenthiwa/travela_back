import BaseException from './baseException';

class TravelCalendarError extends BaseException {
  constructor(message, status) {
    super(message || 'Travel Calendar Error', status || 500);
  }
}

export default TravelCalendarError;
