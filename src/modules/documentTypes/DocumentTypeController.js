import models from '../../database/models';
import CustomError from '../../helpers/Error';

export default class DocumentTypeController {
  static async addDocumentType(req, res) {
    const { name } = req.body;
    try {
      const documentType = await models.DocumentTypes.create({
        name: name.toLowerCase(),
      });
      res.status(201).json({
        success: true,
        message: 'Document type added successfully',
        documentType,
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return CustomError.handleError('Document type already exists', 409, res);
      }
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async deleteDocumentType(req, res) {
    const { name } = req.params;
    try {
      await models.DocumentTypes.destroy({
        where: {
          name,
        }
      });
      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async fetchDocumentsTypes(req, res) {
    try {
      const documentTypes = await models.DocumentTypes.findAll({ order: [['id', 'DESC']] });
      return res.status(200).json({
        success: true,
        documentTypes,
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError('Server Error', 500, res);
    }
  }

  static async updateDocumentType(req, res) {
    try {
      const { name, newName } = req.body;
      const document = await models.DocumentTypes
        .update({ name: newName.toLowerCase() }, { returning: true, where: { name } });
      const [rowsUpdated, [updatedDocument]] = document;

      if (!rowsUpdated) {
        const error = 'Document type not found!';
        return CustomError.handleError(error, 404, res);
      }

      return res.status(200).json({
        success: true,
        message: 'Document type updated successfully!',
        documentType: updatedDocument
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return CustomError.handleError('Document type already exists', 409, res);
      }
      /* istanbul ignore next */
      return CustomError.handleError('Server Error', 500, res);
    }
  }
}
