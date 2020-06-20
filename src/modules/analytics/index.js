import express from 'express';
import middleware from '../../middlewares';
import TripsController from './trips/TripsController';
import AnalyticsController from './travelRequests/analyticsController';
import ReadinessController from './travelReadiness/ReadinessController';
import CalendarController from './travelCalendar/TravelCalendar';
import { travelReadinessValidators } from '../../helpers/validators';

const Router = express.Router();

const {
  authenticate, RoleValidator, analyticsValidator, travelCalendarValidator, Validator
} = middleware;

Router.get(
  '/analytics/trips/departments',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  analyticsValidator.validateFilterAndType,
  TripsController.getTripsPerMonth,
);

Router.get('/analytics',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  AnalyticsController.analytics);

Router.get(
  '/analytics/readiness',
  authenticate,
  travelReadinessValidators,
  Validator.validateRequest,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  ReadinessController.getReadinessCsv
);

Router.get('/analytics/calendar',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  travelCalendarValidator.validateRequestQuery,
  CalendarController.getTravelCalendarAnalytics);
export default Router;
