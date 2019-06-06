import dotenv from 'dotenv';
import { Op } from 'sequelize';
import models from '../../database/models';
import DepartmentController from '../../modules/department/DepartmentController';
import UserRoleUtils from '../../modules/userRole/UserRoleUtils';
import UserRoleController from '../../modules/userRole/UserRoleController';

dotenv.config();

class UserRole {
  static async createdUserInfo(user, userOnBamboo) {
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
    return createdUser;
  }

  static async getUserAttributes(req) {
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
    return { include, attributes };
  }

  static async getUserRoles() {
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
    return result;
  }

  static async checkBudgetCheckerStatus(user) {
    const isBudgetChecker = await models.UserRole.findOne({
      where: {
        userId: user.id,
        roleId: 60000
      }
    });
    return isBudgetChecker;
  }

  static async setHeadersForUser(req) {
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
    return { url, headers };
  }

  static async getDeletedRole(req) {
    const { roles } = req.user;
    const { userId, roleId } = req.params;
    // checks if role to delete is super admin
    const RequestUserRoleIds = roles.map(role => role.dataValues.id);
    const superAdminId = 10948;
    const isRequestUserSuperAdmin = RequestUserRoleIds.includes(superAdminId);
    if (parseInt(roleId, 10) === superAdminId && !isRequestUserSuperAdmin) {
      const errorMsg = `Only a 'Super Administrator' can change the role of another 'Super Administrator'`; // eslint-disable-line
      
      return { error: { msg: errorMsg, status: 403 } };
    }
    const query = { where: { userId, roleId } };
    const deletedRole = await models.UserRole.destroy(query);
    return { deletedRole };
  }


  static async getDeleteUserMessage(req) {
    const { userId, roleId } = req.params;

    const { error, deletedRole } = await UserRole.getDeletedRole(req);
    if (error) return { error };
    if (!deletedRole) {
      const errorMsg = `User with the role: '${req.roleName}' does not exist`;
      return { error: { msg: errorMsg, status: 404 } };
    }
    const msg = `User can no longer perform operations associated with the role: '${
      req.roleName
      }'`; // eslint-disable-line
    const message = [200, msg, true];

    if (roleId === '60000') {
      await DepartmentController.deletedUserDepartment(userId);
    }
    return { message };
  }

  static async getBudgetCheckerDepts(departments, user) {
    if (!user) {
      return { error: { message: 'User does not exist', status: 404 } };
    }
    const isBudgetChecker = await UserRole.checkBudgetCheckerStatus(user);
    if (!isBudgetChecker) {
      return { error: { message: 'User is not a budget checker', status: 409 } };
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
    return { budgetCheckerDepartments };
  }

  static async getUserMetaInfo(req) {
    const {
      roleId, centerId,
      body: {
        email, center, roleName, departments
      },
      user: { UserInfo: { name } }
    } = req;
    let user = await UserRoleUtils.getUser(email);
    let dept;
    if (!user) {
      const { found, createdUser } = await UserRoleController.createUserFromApi(req);
      if (!found) {
        return { error: { msg: 'Email does not exist', status: 404 } };
      }
      user = createdUser;
    }
    const hasRole = await models.UserRole.find({
      where: { roleId, userId: user.id }
    });
    if (hasRole) {
      return { error: { msg: 'User already has this role', status: 409 } };
    }
    await UserRoleController.addMuftiCenter(centerId, user, roleId);
    if (roleId === 60000) {
      dept = await DepartmentController.assignDepartments(departments, user);
    }
    const message = [200, 'Role updated successfully', true];
    await UserRoleUtils.sendNotificationEmail(user, roleName, name);
    const {
      fullName, id, userId,
    } = user;
    const values = {
      name: fullName, email: user.email, id, userId, roleName, center, dept,
    };
    return { message, values };
  }
}

export default UserRole;
