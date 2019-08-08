import express from 'express';
import ErrorBoundaryController from './ErrorBoundaryController';
import ErrorBoundaryValidator from '../../middlewares/errorBoundaryValidator';

import middleware from '../../middlewares';

const { authenticate } = middleware;

if (!global.crashReports) {
  global.crashReports = [];
}
const Router = new express.Router();

Router.post('/errorBoundary',
  ErrorBoundaryValidator.validateCrashReport,
  ErrorBoundaryController.handleCrash);

Router.delete('/errorBoundary/crashReports',
  authenticate,
  ErrorBoundaryController.clearCrashReports);

export default Router;
