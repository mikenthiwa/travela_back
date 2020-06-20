import TripModificationValidator from './tripModificationsValidator';
import authenticate from './authenticate';
import Validator from './Validator';
import validateDirectReport from './validateDirectReport';
import tripValidator from './tripValidator';
import RoleValidator from './RoleValidator';
import analyticsValidator from './analyticsValidator';
import DocumentsValidator from './DocumentsValidator';
import ChecklistValidator from './checklistValidator';
import travelCalendarValidator from './travelCalendarValidator';
import RequestValidator from './RequestValidator';
import TravelReadinessDocumentValidator from './travelReadinessDocumentsValidator';
import ReminderEmailTemplateValidator from './reminderEmailTemplateValidator';
import ReminderValidator from './reminderValidator';
import TravelReasonsValidator from './travelReasonsValidator';
import TravelStipendValidator from './travelStipendValidator';
import DepartmentValidation from './DepartmentValidation';
import BambooWebhookValidator from './BambooWebhookValidator';
import TravelRegionsValidator from './travelRegionsValidator';
import CountryValidator from './countryValidator';
import HotelEstimateValidator from './hotelEstimateValidator';
import DynamicChecklistValidator from './dynamicChecklistValidator';
import documentTypeValidator from './documentTypeValidator';


const middleware = {
  authenticate,
  Validator,
  validateDirectReport,
  tripValidator,
  RoleValidator,
  analyticsValidator,
  DocumentsValidator,
  ChecklistValidator,
  travelCalendarValidator,
  RequestValidator,
  TravelReadinessDocumentValidator,
  ReminderValidator,
  ReminderEmailTemplateValidator,
  TravelReasonsValidator,
  TravelStipendValidator,
  TripModificationValidator,
  DepartmentValidation,
  BambooWebhookValidator,
  TravelRegionsValidator,
  CountryValidator,
  HotelEstimateValidator,
  DynamicChecklistValidator,
  documentTypeValidator,
};

export default middleware;
