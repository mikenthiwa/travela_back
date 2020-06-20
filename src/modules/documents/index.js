import express from 'express';
import middleware from '../../middlewares';
import DocumentsController from './DocumentsController';

const DocumentsRouter = express.Router();
const { authenticate, DocumentsValidator } = middleware;

DocumentsRouter.delete(
  '/documents/:documentId',
  authenticate,
  DocumentsController.deleteDocument
);

DocumentsRouter.get(
  '/documents',
  authenticate,
  DocumentsController.fetchDocuments
);

DocumentsRouter.put(
  '/documents/:documentId',
  authenticate,
  DocumentsValidator.validateDocumentName,
  DocumentsController.updateDocument
);

DocumentsRouter.post(
  '/documents',
  authenticate,
  DocumentsValidator.validateCloudinaryPayload,
  DocumentsValidator.validateDocumentName,
  DocumentsController.addDocument
);

export default DocumentsRouter;
