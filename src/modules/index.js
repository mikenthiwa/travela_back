import healthCheckRouter from './healthCheck';
import requestsRouter from './requests';
import approvalsRouter from './approvals';
import userRoleRouter from './userRole';
import commentsRouter from './comments';
import notificationRouter from './notifications';
import occupationsRouter from './occupations';
import centerRouter from './centers';
import guestHouseRouter from './guestHouse';
import tripsRouter from './trips';
import analyticsRouter from './analytics';
import travelChecklistRouter from './travelChecklist';
import documentsRouter from './documents';
import travelReadinessRouter from './travelReadinessDocuments';
import reminderManagementRouter from './reminderManagement';
import remindersRouter from './reminders';
import travelReasons from './travelReasons';
import travelStipendRouter from './travelStipend';
import departmentRouter from './department';
import bamboohrRouter from './bamboohr';
import travelRegionsRouter from './travelRegions';
import countriesRouter from './countries';
import tripModificationsRouter from './tripModifications';
import hotelEstimateRouter from './hotelEstimate';
import travelCostsRouter from './travelCosts';
import helpResourcesRouter from './helpResources';
import FlightRouter from './flightEstimate/index';
import checklistWizard from './checklistWizard';

const apiPrefix = '/api/v1';

// add your route to this list
const routes = [
  healthCheckRouter,
  requestsRouter,
  approvalsRouter,
  userRoleRouter,
  commentsRouter,
  notificationRouter,
  occupationsRouter,
  guestHouseRouter,
  tripsRouter,
  centerRouter,
  travelChecklistRouter,
  analyticsRouter,
  documentsRouter,
  travelReadinessRouter,
  reminderManagementRouter,
  remindersRouter,
  travelReasons,
  travelStipendRouter,
  departmentRouter,
  bamboohrRouter,
  travelRegionsRouter,
  countriesRouter,
  tripModificationsRouter,
  hotelEstimateRouter,
  travelCostsRouter,
  helpResourcesRouter,
  FlightRouter,
  checklistWizard,
];
export default (app) => {
  routes.forEach(route => app.use(apiPrefix, route));
  return app;
};
