import dotenv from 'dotenv';
import axios from 'axios';
import models from '../../database/models';
import CustomError from '../../helpers/Error';
import UserHelper from '../../helpers/user';
import UserRoleUtils from './UserRoleUtils';
import DepartmentController from '../department/DepartmentController';
import UserRoleHelper from '../../helpers/userRole/index';


dotenv.config();

class UserRoleController {
  static response(res, message, result, token = null) {
    return res.status(message[0]).json({
      success: message[2],
      message: message[1],
      result,
      token
    });
  }

  static async getAllUser(req, res) {
    const { include, attributes } = await UserRoleHelper.getUserAttributes(req);
    const result = await models.User.findAll({
      attributes,
      include
    });
    const message = [200, 'data', true];
    UserRoleController.response(res, message, result);
  }

  static async getOneUser(req, res) {
    const { id } = req.user;
    const result = await UserRoleUtils.getOneUserSql(req, id);
    const message = [200, 'data', true];
    UserRoleController.response(res, message, result);
  }

  static async updateUserProfile(req, res) {
    const {
      department, passportName, occupation, gender, manager, location
    } = req.body;
    const user = await models.User.findOne({ where: { userId: req.params.id } });
    if (!user) {
      const message = [400, 'User does not exist', false];
      return UserRoleController.response(res, message);
    }
    const result = await user.update({
      passportName: passportName || user.passportName,
      department: department || user.department,
      occupation: occupation || user.occupation,
      manager: manager || user.manager,
      gender: gender || user.gender,
      location: location || user.location
    });

    if (department) await DepartmentController.createDepartmentFromEndpoint(department);
    const message = [200, 'Profile updated successfully', true];
    UserRoleController.response(res, message, result);
  }

  static async addUser(req, res) {
    try {
      const userData = UserHelper.decodeToken(req.body.token);
      const result = await UserRoleUtils.addOneUserSql(userData);
      await result.addRole(401938);
      if (result.dataValues.gender && result.dataValues.manager === null) {
        const userOnBamboo = await UserHelper.getUserOnBamboo(result.bambooHrId);
        const manager = await models.User.find({
          where: {
            bambooHrId: userOnBamboo.data.supervisorEId
          },
        });
        if (manager) {
          await manager.addRole(53019);
          await result.update({ manager: manager.dataValues.id });
        }
      }
      await result.update({ picture: userData.picture });
      const message = [201, 'User Found', true];
      const token = await UserHelper.setToken(result);
      return UserRoleController.response(res, message, result, token);
    } catch (error) { /* istanbul ignore next */
      return CustomError.handleError(error.toString(), 500, res);
    }
  }

  static async getUserFromApi(req) {
    const { url, headers } = await UserRoleHelper.setHeadersForUser(req);
    const data = await axios.get(url, {
      headers
    });
    return data;
  }

  static async createUserFromApi(req) {
    const { data } = await UserRoleController.getUserFromApi(req);
    const user = data.values[0];
    if (data.total === 0) {
      return { found: false };
    }
    const userOnBamboo = await UserHelper.getUserOnBamboo(user.bamboo_hr_id);

    const createdUser = await UserRoleHelper.createdUserInfo(user, userOnBamboo);
    await DepartmentController.createDepartmentFromEndpoint(userOnBamboo.data.department);
    return { createdUser, found: true };
  }

  static async updateUserRole(req, res) {
    try {
      const { error, values, message } = await UserRoleHelper.getUserMetaInfo(req);
      if (error) return CustomError.handleError(error.msg, error.status, res);
      UserRoleController.response(res, message, values);
    } catch (error) {
      /* istanbul ignore next */
      res.status(500).json({
        message: 'error',
        error
      });
    }
  }

  static async addMuftiCenter(centerId, user, roleId) {
    return centerId && centerId.length > 0
      ? Promise.all(centerId.map(addCenter => models.UserRole.create({
        userId: user.id, roleId, centerId: addCenter.id
      }))) : user.addRole(roleId);
  }

  static async addRole(req, res) {
    try {
      const result = await models.Role.create(req.body);
      const message = [201, 'Role created successfully', true];
      UserRoleController.response(res, message, result);
    } catch (error) {
      const message = [409, 'Role already exist', false];
      UserRoleController.response(res, message, error);
    }
  }

  static async getRoles(req, res) {
    const result = await UserRoleHelper.getUserRoles();
    const message = [200, 'data', true];
    UserRoleController.response(res, message, result);
  }

  static async getOneRole(req, res) {
    const { id: roleId } = req.params;
    const { search } = req.query;
    const errormessage = UserRoleUtils.sanitizePaginationParams(req, roleId);

    if (errormessage) {
      return UserRoleController.response(res, errormessage);
    }

    try {
      const roles = await UserRoleController.calculateUserRole(roleId, search);
      if (!roles) {
        const message = [404, 'Role does not exist', false];
        return UserRoleController.response(res, message);
      }
      UserRoleUtils.searchReceived(req, roles, search, res);
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async calculateUserRole(roleId, search = '') {
    const result = await UserRoleUtils.calculateUserRoleSql(roleId, search);
    return result;
  }

  static async findUserDetails(req) {
    const { email } = req.user.UserInfo;
    const getId = await models.User.findOne({ where: { email } });
    const userWithEmail = await UserRoleUtils.getUserWithEmail(email, getId);
    return userWithEmail;
  }

  static async autoAdmin(req, res) {
    try {
      const findUser = await UserRoleController.findUserDetails(req);
      if (findUser.email !== process.env.DEFAULT_ADMIN) {
        const message = [409, 'Email does not match', false];
        UserRoleController.response(res, message);
      } else {
        await findUser.addRole(10948);
        const message = [200, 'Your role has been Updated to a Super Admin', true];
        UserRoleController.response(res, message);
      }
    } catch (error) {
      const message = [400, 'Email does not exist in Database', false];
      UserRoleController.response(res, message);
    }
  }

  static async getRecipient(recipientName, recipientUserId, recipientId) {
    const recipient = await models.User.findOne({
      where: {
        $or: [{ fullName: recipientName }, { userId: recipientUserId }, { id: recipientId }]
      }
    });
    return recipient;
  }

  static async deleteUserRole(req, res) {
    try {
      const {
        error, message
      } = await UserRoleHelper.getDeleteUserMessage(req);
      if (error) return CustomError.handleError(error.msg, error.status, res);
      return UserRoleController.response(res, message);
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError(error, 500, res);
    }
  }

  static async updateBudgetCheckerRole(req, res) {
    try {
      const { body: { email, departments } } = req;
      
      await models.sequelize.transaction(async () => {
        const user = await UserRoleUtils.getUser(email);
        const { error, budgetCheckerDepartments } = await UserRoleHelper.getBudgetCheckerDepts(departments, user);
        if (error) return CustomError.handleError(error.message, error.status, res);
        return res.status(200).json({
          success: true,
          message: 'Budget checker role updated successfully',
          user,
          budgetCheckerDepartments,
        });
      });
    } catch (error) { // istanbul ignore next
      return CustomError.handleError(error.toString(), 500, res);
    }
  }
}

export default UserRoleController;
