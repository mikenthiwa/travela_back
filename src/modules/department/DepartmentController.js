import models from '../../database/models';
import Error from '../../helpers/Error';


class DepartmentController {
  static async getDepartment(req, res) {
    try {
      const document = await models.Department.findAll();
      res.status(200).json({
        success: true,
        message: 'Document list',
        document
      });
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async createDepartment(req, res, department) {
    try {
      const { name } = req.body;
      const newDocument = await models.Department.findOrCreate({
        where: { name: name || department }
      });
      return req.url === '/department'
        ? res.status(201).json({
          success: true,
          message: 'Successfully created a new Department',
          newDocument
        }) : null;
    } catch (error) { /* istanbul ignore next */
      return req.url === '/department'
        ? res.status(500).json({
          success: false,
          message: 'An error occurred',
          error
        }) : null;
    }
  }
}

export default DepartmentController;
