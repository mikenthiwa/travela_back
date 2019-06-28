import models from '../../database/models';
import CustomError from '../../helpers/Error';
import Utils from '../../helpers/Utils';

const { Op } = models.Sequelize;
export default class DocumentsController {
  static async addDocument(req, res) {
    try {
      const addedDocument = await models.Document.create({
        ...req.body,
        id: Utils.generateUniqueId(),
        userId: req.user.UserInfo.id
      });
      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        addedDocument
      });
    } catch (error) {
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async deleteDocument(req, res) {
    const { id } = req.user.UserInfo;
    const { documentId } = req.params;
    try {
      const deletedDocument = await models.Document.destroy({
        returning: true,
        where: {
          id: documentId,
          userId: id
        }
      });

      if (!deletedDocument[0]) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
        deletedDocument: deletedDocument[0]
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async fetchDocuments(req, res) {
    const query = { name: req.query.search || '' };
    try {
      const userId = req.user.UserInfo.id;
      const documents = await models.Document.findAll({
        order: [['updatedAt', 'DESC']],
        where: {
          userId,
          name: {
            [Op.iLike]: `%${query.name}%`,
          }
        }
      });
      if (documents.length < 1) {
        return CustomError.handleError('No documents found', 404, res);
      }
      return res.status(200).json({
        success: true,
        message: 'Successfully retrieved your documents',
        documents
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError('Server Error', 500, res);
    }
  }

  static async updateDocument(req, res) {
    try {
      const { documentId } = req.params;
      const { id: userId } = req.user.UserInfo;
      const { name } = req.body;
      const where = { id: documentId, userId };
      const document = await models.Document
        .update({ name }, { returning: true, where });
      const [rowsUpdated, [updatedDocument]] = document;

      if (!rowsUpdated) {
        const error = 'Document not found!';
        return CustomError.handleError(error, 404, res);
      }

      return res.status(200).json({
        success: true,
        message: 'Document name updated successfully!',
        document: updatedDocument
      });
    } catch (error) { /* istanbul ignore next */
      return CustomError.handleError('Server Error', 500, res);
    }
  }
}
