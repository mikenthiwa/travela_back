import Validator from './Validator';

export default class ErrorBoundaryValidator {
  static validateCrashReport(req, res, next) {
    req.checkBody('link', 'The browser location link cannot be empty').notEmpty();
    req.checkBody('stackTrace', 'The stack trace is required').notEmpty();
    req.checkBody('stackTraceId', 'The stack trace id is required').notEmpty();
    req.checkBody('info', 'The error information is required').notEmpty();

    const { body: { stackTraceId } } = req;
    if (global.crashReports.includes(stackTraceId)) {
      return res.status(409).json({
        success: false,
        message: 'This error has already been reported.'
      });
    }


    if (!process.env.CRASH_REPORTING_CHANNEL) {
      return res.status(400).json({
        success: false,
        message: 'Crash reporting slack channel is not provided'
      });
    }
    return Validator.errorHandler(res, req.validationErrors(), next);
  }
}
