import dotenv from 'dotenv';
import axios from 'axios';
import { Op } from 'sequelize';
import models from '../../database/models';
import CustomError from '../../helpers/Error';
import UserHelper from '../../helpers/user';
import NotificationEngine from '../notifications/NotificationEngine';
import UserRoleUtils from './UserRoleUtils';
import DepartmentController from '../department/DepartmentController';

dotenv.config();

class UserRoleController {
  static response(res, message, result) {
    return res.status(message[0]).json({
      success: message[2],
      message: message[1],
      result
    });
  }

  static async getAllUser(req, res) {
    const allowedField = ['email'];
    const field = allowedField.includes(req.query.field);
    const filter = field ? req.query.field : '';
    const include = !field
      ? [
        {
          model: models.Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
      : '';
    const attributes = filter ? ['fullName', `${filter}`] : '';

    const result = await models.User.findAll({
      attributes,
      include
    });
    const message = [200, 'data', true];
    UserRoleController.response(res, message, result);
  }

  static async getOneUser(req, res) {
    const { id } = req.user;
    const result = await models.User.findOne({
      where: { userId: req.params.id },
      include: [
        {
          model: models.Role,
          as: 'roles',
          attributes: ['roleName', 'description'],
          through: { attributes: [] },
          include: [
            {
              model: models.Center,
              as: 'centers',
              attributes: ['id', 'location'],
              through: {
                attributes: [],
                where: { userId: id }
              }
            }
          ],
        },
        {
          model: models.Department,
          as: 'budgetCheckerDepartments',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        }
      ]
    });
    const message = [200, 'data', true];
    UserRoleController.response(res, message, result);
  }

  static async updateUserProfile(req, res) {
    const {
      department, passportName, occupation, gender, manager, location
    } = req.body;
    const user = await models.User.findOne({
      where: {
        userId: req.params.id
      }
    });
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
    const userId = req.user.UserInfo.id;
    try {
      if (!userId) {
        const message = [400, 'User Id required', false];
        return UserRoleController.response(res, message);
      }
      const [result, userCreated] = await models.User.findOrCreate({
        where: {
          email: req.user.UserInfo.email,
          userId: req.user.UserInfo.id
        },
        defaults: {
          picture: req.user.UserInfo.picture,
          fullName: req.user.UserInfo.name,
          location: 'Lagos'
        }
      });
      const [userRole] = await result.addRole(401938);
      result.dataValues.roles = userRole;
      const message = [201, 'User created successfully', true];
      UserHelper.authorizeRequests(req.userToken);
      const userOnProduction = await UserHelper.getUserOnProduction(result);
      const bambooHRID = userOnProduction.data.values[0].bamboo_hr_id;
      const userOnBamboo = await UserHelper.getUserOnBamboo(bambooHRID);
      const managerOnBamboo = await UserHelper.getUserOnBamboo(userOnBamboo.data.supervisorEId);
      const managerOnProduction = await
      UserHelper.getManagerOnProduction(userOnBamboo.data.supervisorEId);
      const travelaUser = UserHelper.generateTravelaUser(managerOnProduction, managerOnBamboo);
      const userLocation = UserHelper.getUserLocation(userOnBamboo.data.location);
      const [managerResult] = await models.User.findOrCreate({
        where: {
          email: travelaUser.email,
          userId: travelaUser.userId
        },
        defaults: {
          picture: travelaUser.picture,
          fullName: travelaUser.fullName,
          location: travelaUser.location,
          gender: travelaUser.gender,
          department: travelaUser.department,
          occupation: travelaUser.occupation
        }
      });
      await DepartmentController.createDepartmentFromEndpoint(managerResult.department);
      const newLocation = !userOnProduction.data.values[0].location
        ? userLocation
        : userOnProduction.data.values[0].location.name;

      const updateData = {
        department: userOnBamboo.data.department,
        occupation: userOnBamboo.data.jobTitle,
        manager: travelaUser.fullName,
        passportName: userOnProduction.data.values[0].name,
        location: newLocation,
        gender: userOnBamboo.data.gender
      };
      await managerResult.addRole(53019);
      // Update data for only new users or users with valid bambooHR id
      if (bambooHRID !== 0 || userCreated) await result.update(updateData);
      await DepartmentController.createDepartmentFromEndpoint(updateData.department);
      return UserRoleController.response(res, message, result);
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError(error.toString(), 500, res);
    }
  }

  static async getUserFromApi(req) {
    const {
      body: { email },
      userToken
    } = req;
    const baseUrL = process.env.ANDELA_PROD_API;

    const url = `${baseUrL}/users?email=${email}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    };
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

    const createdUser = await models.User.create({
      fullName: user.name,
      email: user.email,
      userId: user.id,
      picture: user.picture,
      location: user.location ? user.location.name : '',
      department: userOnBamboo.data.department,
      occupation: userOnBamboo.data.jobTitle,
      gender: userOnBamboo.data.gender,
    });
    await DepartmentController.createDepartmentFromEndpoint(userOnBamboo.data.department);
    return { createdUser, found: true };
  }

  static async updateUserRole(req, res) {
    try {
      const {
        roleId,
        centerId,
        body: {
          email, center, roleName, departments
        },
        user: {
          UserInfo: { name }
        }
      } = req;
      let user = await UserRoleUtils.getUser(email);
      let dept;
      if (!user) {
        const { found, createdUser } = await UserRoleController.createUserFromApi(req);
        if (!found) {
          const message = 'Email does not exist';
          return CustomError.handleError(message, 404, res);
        }
        user = createdUser;
      }
      const hasRole = await models.UserRole.find({
        where: { roleId, userId: user.id }
      });
      const error = 'User already has this role';
      if (hasRole) return CustomError.handleError(error, 409, res);
      
      await UserRoleController.addMuftiCenter(centerId, user, roleId);
      if (roleId === 60000) {
        dept = await DepartmentController.assignDepartments(departments, user);
      }
      const message = [200, 'Role updated successfully', true];
      await UserRoleController.sendNotificationEmail(user, roleName, name);
      const values = {
        name: user.fullName,
        email: user.email,
        id: user.id,
        userId: user.userId,
        roleName,
        center,
        dept,
      };
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
    const result = await models.Role.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: models.User,
          as: 'users',
          attributes: ['email', 'userId'],
          through: { attributes: [] }
        }
      ]
    });
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
        if (search) {
          const message = [404, 'User does not exist for this role', false];
          return UserRoleController.response(res, message);
        }
        const message = [404, 'Role does not exist', false];
        return UserRoleController.response(res, message);
      }

      const { allPage } = req.query;
      const count = roles.users.length;
      const userRoles = UserRoleUtils.getAllOrPaginatedRoles({
        req,
        roles,
        count,
        allPage
      });

      const meta = { count, ...userRoles.meta };
      const message = [200, 'data', true];

      UserRoleController.response(res, message, {
        ...userRoles.roleData,
        users: userRoles.users,
        meta
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async calculateUserRole(roleId, search = '') {
    const result = await models.Role.findById(roleId, {
      order: [[{ model: models.User, as: 'users' }, models.UserRole, 'createdAt', 'DESC']],
      include: [
        {
          model: models.User,
          as: 'users',
          attributes: ['email', 'fullName', 'userId', 'id', 'location'],
          where: {
            fullName: {
              [Op.iLike]: `%${search}%`
            }
          },
          through: { attributes: [] },
          include: [
            {
              model: models.Center,
              as: 'centers',
              attributes: ['id', 'location'],
              through: {
                attributes: [],
                where: { roleId }
              }
            },
            {
              model: models.Department,
              as: 'budgetCheckerDepartments',
              attributes: ['id', 'name'],
              through: { attributes: [] },
            }
          ]
        }
      ]
    });
    return result;
  }

  static async findUserDetails(req) {
    const { email } = req.user.UserInfo;
    const userWithEmail = await models.User.findOne({
      where: {
        email
      },
      include: [
        {
          model: models.Role,
          as: 'roles',
          attributes: ['roleName'],
          through: { attributes: [] },
        },
        {
          model: models.Department,
          as: 'budgetCheckerDepartments',
          attributes: ['name'],
          through: { attributes: [] },
        }
      ]
    });
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

  static async getRecipient(recipientName, recipientId) {
    const recipient = await models.User.findOne({
      where: {
        $or: [{ fullName: recipientName }, { userId: recipientId }]
      }
    });
    return recipient;
  }

  static async deleteUserRole(req, res) {
    try {
      const { roles } = req.user;
      const { userId, roleId } = req.params;
      // checks if role to delete is super admin
      const RequestUserRoleIds = roles.map(role => role.dataValues.id);
      const superAdminId = 10948;
      const isRequestUserSuperAdmin = RequestUserRoleIds.includes(superAdminId);
      if (parseInt(roleId, 10) === superAdminId && !isRequestUserSuperAdmin) {
        const error = `Only a 'Super Administrator' can change the role of another 'Super Administrator'`; // eslint-disable-line
        return CustomError.handleError(error, 403, res);
      }
      const query = { where: { userId, roleId } };
      const deletedRole = await models.UserRole.destroy(query);
      const msg = `User can no longer perform operations associated with the role: '${
        req.roleName
        }'`; // eslint-disable-line
      const message = [200, msg, true];
      if (deletedRole) {
        if (roleId === '60000') {
          await DepartmentController.deletedUserDepartment(userId);
        }
        return UserRoleController.response(res, message);
      }

      const error = `User with the role: '${req.roleName}' does not exist`;
      if (!deletedRole) return CustomError.handleError(error, 404, res);
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError(error, 500, res);
    }
  }

  static async sendNotificationEmail(user, roleName, name) {
    const { email, fullName } = user;
    const data = {
      recipient: { name: fullName, email },
      topic: 'Assignment of new role',
      type: 'Send role assignment email notification',
      redirectLink: `${process.env.REDIRECT_URL}`,
      details: { role: roleName, assignerName: name }
    };
    NotificationEngine.sendMail(data);
  }

  static async updateBudgetCheckerRole(req, res) {
    try {
      const { body: { email, departments } } = req;
      await models.sequelize.transaction(async () => {
        const user = await UserRoleUtils.getUser(email);
        if (!user) {
          return CustomError.handleError('User does not exist', 404, res);
        }
        const isBudgetChecker = await models.UserRole.findOne({
          where: {
            userId: user.id,
            roleId: 60000
          }
        });
        if (!isBudgetChecker) {
          return CustomError.handleError('User is not a budget checker', 409, res);
        }
        const budgetCheckerDepartments = await DepartmentController
          .assignDepartments(departments, user);
        // Delete other departments asides from the received departments
        await models.UsersDepartments.destroy({
          where: {
            userId: user.id,
            departmentId: { [Op.notIn]: budgetCheckerDepartments.map(d => d.id) }
          }
        });
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
