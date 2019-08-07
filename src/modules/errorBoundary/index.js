import express from 'express';
import ErrorBoundaryController from './ErrorBoundaryController';
import ErrorBoundaryValidator from '../../middlewares/errorBoundaryValidator';

if (!global.crashReports) {
  global.crashReports = [];
}
const Router = new express.Router();

Router.post('/errorBoundary',
  ErrorBoundaryValidator.validateCrashReport,
  ErrorBoundaryController.handleCrash);

export default Router;
