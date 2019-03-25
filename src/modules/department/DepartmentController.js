import _ from 'lodash';
import models from '../../database/models';
import Error from '../../helpers/Error';

class DepartmentController {
  static handleResponse(res, code, message) {
    return res.status(code).json({
      success: true,
      message: message[0],
      result: message[1]
    });
  }

  static async getDepartment(req, res) {
    try {
      const department = await models.Department.findAll();
      const message = ['Department List', department];
      return DepartmentController.handleResponse(res, 200, message);
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async createDepartmentFromApi(req, res) {
    try {
      const { name } = req.body;
      const newDepartment = await DepartmentController.createDepartment(name);
      const message = ['Successfully created a new Department', newDepartment];
      return DepartmentController.handleResponse(res, 201, message);
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async createDepartmentFromEndpoint(department) {
    try {
      const newDepartment = await DepartmentController.createDepartment(department);
      return newDepartment;
    } catch (error) { /* istanbul ignore next */
      return error;
    }
  }

  static async createDepartment(department) {
    try {
      const newDocument = await models.Department.findOrCreate({
        where: { name: _.capitalize(department) }
      });
      return newDocument;
    } catch (error) { /* istanbul ignore next */
      return error;
    }
  }

  static async assignDepartments(allDepartments, user) {
    try {
      const addUserDept = await models.sequelize.transaction(async () => {
        const createUserDepartment = async (dept) => {
          const [department] = await models.Department.findOrCreate({
            where: { name: dept }
          });
          await models.UsersDepartments.findOrCreate({
            where: {
              userId: user.id,
              departmentId: department.id
            }
          });
          return department;
        };
        const userDept = await Promise.all(allDepartments.map(
          dept => createUserDepartment(dept)
        ));
        return userDept;
      });
      return addUserDept;
    } catch (error) { /* istanbul ignore next */
      return error;
    }
  }

  static async deletedUserDepartment(id) {
    try {
      const deleteDepartment = await models.UsersDepartments.destroy(
        {
          where: {
            userId: {
              $in: [id]
            }
          }
        }
      );
      return deleteDepartment;
    } catch (error) {
      return error;
    }
  }
}

export default DepartmentController;
