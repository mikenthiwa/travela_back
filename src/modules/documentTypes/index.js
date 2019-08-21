import express from 'express';
import middleware from '../../middlewares';
import DocumentTypeController from './DocumentTypeController';

const DocumentTypeRouter = express.Router();
const { authenticate, documentTypeValidator, RoleValidator } = middleware;

const roleValidator = RoleValidator.checkUserRole([
  'Super Administrator',
  'Travel Administrator',
  'Travel Team Member'
]);

DocumentTypeRouter.delete(
  '/documents/types/delete/:name',
  authenticate,
  roleValidator,
  DocumentTypeController.deleteDocumentType
);

DocumentTypeRouter.get(
  '/documents/types',
  authenticate,
  DocumentTypeController.fetchDocumentsTypes
);

DocumentTypeRouter.patch(
  '/documents/types',
  authenticate,
  roleValidator,
  documentTypeValidator.verifyBody,
  DocumentTypeController.updateDocumentType
);

DocumentTypeRouter.post(
  '/documents/types',
  authenticate,
  roleValidator,
  documentTypeValidator.verifyBody,
  DocumentTypeController.addDocumentType
);

export default DocumentTypeRouter;
