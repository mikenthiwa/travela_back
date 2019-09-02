import _ from 'lodash';
import models from '../../database/models';
import Error from '../../helpers/Error';
import Pagination from '../../helpers/Pagination';

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
      const department = await models.Department.findAll({
        include: [
          { model: models.User, as: 'creator' },
          { model: models.Department, as: 'parentDepartments' }]
      });
      const message = ['Department List', department];
      return DepartmentController.handleResponse(res, 200, message);
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async getSingleDepartment(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Successfully retrieved Department',
        department: req.body.departmentToDelete
      });
    } catch (error) { /* istanbul ignore next */
      Error.handleError(error.message, 500, res);
    }
  }

  static async getAllDepartments(req, res) {
    try {
      const { query: { page } } = req;
      const limit = req.query.limit && req.query.limit > 0 ? req.query.limit : 10;
      const { options } = Pagination;
      const { countOptions, parentOptions } = options(req);
      const count = await models.Department.count(countOptions);
      const pageCount = Math.ceil(count / limit);
      const currentPage = page < 1 || !page || pageCount === 0 ? 1 : Math.min(page, pageCount);
      const offset = limit * (currentPage - 1);
      const departments = await models.Department.findAll({
        ...parentOptions, limit, offset, order: [['id', 'DESC']]
      });
      return res.status(200).json({
        success: true,
        message: 'success',
        metaData: {
          departments,
          pagination: {
            pageCount,
            currentPage,
            count
          }
        }
      });
    } catch (error) { /* istanbul ignore next */
      Error.handleError(error.message, 500, res);
    }
  }

  // static async createDepartmentFromApi(req, res) {
  //   try {
  //     const { name } = req.body;
  //     const newDepartment = await DepartmentController.createDepartment(name);
  //     const message = ['Successfully created existing Department', newDepartment];
  //     return DepartmentController.handleResponse(res, 201, message);
  //   } catch (error) { /* istanbul ignore next */
  //     return Error.handleError('Server Error', 500, res);
  //   }
  // }

  static async editDepartmentByAdmin(req, res) {
    try {
      const { name, createdParentDepartment, departmentToDelete } = req.body;
      const parentDepartmentValue = createdParentDepartment ? createdParentDepartment.id : null;
      const modifiedDepartment = await departmentToDelete.update({
        name: _.capitalize(name),
        createdBy: req.user.UserInfo.id,
        parentDepartment: parentDepartmentValue
      });

      return res.status(200).json({
        success: true,
        message: 'Successfully modified existing Department',
        department: modifiedDepartment,
        modifiedBy: req.user.UserInfo.fullName,
        parentDepartment: createdParentDepartment ? createdParentDepartment.name : null
      });
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async createDepartmentByAdmin(req, res) {
    try {
      const { name, createdParentDepartment } = req.body;
      const parentDepartmentValue = createdParentDepartment ? createdParentDepartment.id : null;
      const [newDepartment] = await models.Department.findOrCreate({
        where: { name: _.capitalize(name) },
        defaults: { name: _.capitalize(name), createdBy: req.user.UserInfo.id, parentDepartment: parentDepartmentValue },
      });

      return res.status(201).json({
        success: true,
        message: 'Successfully created a new Department',
        department: newDepartment,
        createdBy: req.user.UserInfo.fullName,
        parentDepartment: createdParentDepartment ? createdParentDepartment.name : null
      });
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async deleteDepartment(req, res) {
    try {
      const { departmentToDelete } = req.body;
      const deletedDepartment = await departmentToDelete.destroy();

      res.status(200).json({
        success: true,
        message: 'Successfully deleted department',
        deletedDepartment
      });
    } catch (error) { /* istanbul ignore next */
      return error;
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
    } catch (error) { /* istanbul ignore next */
      return error;
    }
  }
}

export default DepartmentController;
