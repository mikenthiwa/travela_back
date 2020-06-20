import express from 'express';
import middleware from '../../middlewares';
import TravelReadinessController from './TravelReadinessController';

const {
  authenticate,
  TravelReadinessDocumentValidator,
  RoleValidator,
  Validator
} = middleware;
const TravelReadinessRouter = express.Router();

TravelReadinessRouter.post(
  '/travelreadiness',
  authenticate,
  TravelReadinessDocumentValidator.validateInput,
  TravelReadinessDocumentValidator.validateUniqueDocument,
  TravelReadinessController.addTravelReadinessDocument,
);

TravelReadinessRouter.get(
  '/travelreadiness/users',
  authenticate,
  RoleValidator.checkUserRole(
    ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
  ),
  TravelReadinessController.getAllUsersReadiness,
);

TravelReadinessRouter.get(
  '/travelreadiness/users/:id',
  authenticate,
  Validator.checkSignedInUserOrAdmin,
  TravelReadinessController.getUserReadiness,
);

TravelReadinessRouter.get(
  '/travelreadiness/documents/:documentId',
  authenticate,
  TravelReadinessController.getTravelReadinessDocument,
);

TravelReadinessRouter.put(
  '/travelreadiness/documents/:documentId/verify',
  authenticate,
  RoleValidator.checkUserRole(['Super Administrator', 'Travel Administrator', 'Travel Team Member']),
  TravelReadinessController.verifyTravelReadinessDocuments
);

TravelReadinessRouter.put(
  '/travelreadiness/documents/:documentId',
  authenticate,
  TravelReadinessDocumentValidator.checkDocumentAndUser,
  TravelReadinessDocumentValidator.validateInput,
  TravelReadinessDocumentValidator.validateUniqueDocument,
  TravelReadinessController.editTravelReadinessDocument,
);

TravelReadinessRouter.delete(
  '/travelreadiness/documents/:documentId',
  authenticate,
  TravelReadinessController.deleteTravelReadinessDocument
);

TravelReadinessRouter.post(
  '/travelreadiness/documents/scan',
  authenticate,
  TravelReadinessDocumentValidator.checkScanDocument,
  TravelReadinessController.scanOCRPassport
);

export default TravelReadinessRouter;
