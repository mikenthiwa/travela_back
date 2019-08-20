import { Op } from 'sequelize';
import paginationHelper from '../../helpers/Pagination';
import models from '../../database/models';
import UserRoleController from './UserRoleController';
import NotificationEngine from '../notifications/NotificationEngine';
import Utils from '../../helpers/Utils';

class UserRoleUtils {
  static getPaginatedRoles(req, count, roles) {
    const {
      users
    } = roles;

    const {
      currentPage,
      pageCount,
      initialPage
    } = paginationHelper.getPaginationParams(req, count);
    const pagintedUsersRole = users
      .slice(initialPage.offset, (Number.parseInt(initialPage.limit, 10) + initialPage.offset));
    const paginationData = {
      currentPage,
      pageCount,
      pagintedUsersRole,
    };
    return {
      paginationData
    };
  }

  static getAllOrPaginatedRoles({
    req,
    roles,
    count,
    allPage
  }) {
    const {
      id, roleName, description, createdAt, updatedAt, users
    } = roles;
    let userRoles = {
      roleData: {
        id, description, roleName, createdAt, updatedAt
      },
      users
    };

    if (!allPage) {
      const {
        paginationData: { currentPage, pageCount, pagintedUsersRole }
      } = UserRoleUtils.getPaginatedRoles(req, count, roles);
      userRoles = {
        ...userRoles,
        meta: {
          currentPage,
          pageCount,
        },
        users: pagintedUsersRole
      };
    }
    return userRoles;
  }

  static sanitizePaginationParams(req, roleId) {
    if (!Number.isInteger(Number.parseInt(roleId, 10))) {
      const message = [400, 'Params must be an integer', false];
      return message;
    }

    const { allPage } = req.query;

    if (allPage && allPage !== 'true') {
      const message = [400, 'param allPage is optional and should be true', false];
      return message;
    }
    return false;
  }

  static async getUser(email, id) {
    const where = email ? { email } : { id };
    const user = await models.User.findOne({
      where,
      attributes: ['email', 'fullName', 'userId', 'id']
    });
    return user;
  }

  static async searchReceived(req, roles, search, res) {
    const { allPage } = req.query;
    const count = roles.users.length;
    const userRoles = UserRoleUtils.getAllOrPaginatedRoles({
      req,
      roles,
      count,
      allPage
    });
    const meta = { count, ...userRoles.meta, search };
    const message = [200, 'data', true];

    UserRoleController.response(res, message, {
      ...userRoles.roleData,
      users: userRoles.users,
      meta
    });
  }

  static async sendNotificationEmail(user, roleName, name) {
    const { email, fullName } = user;
    const data = {
      recipient: { name: fullName, email },
      topic: 'Assignment of new role',
      type: 'Send role assignment email notification',
      redirectLink: `${process.env.REDIRECT_URL}/redirect`,
      details: { role: roleName, assignerName: name }
    };
    NotificationEngine.sendMail(data);
  }

  static async getUserWithEmail(email, getId) {
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
          include: [
            {
              model: models.Center,
              as: 'centers',
              attributes: ['id', 'location'],
              through: {
                attributes: [],
                where: { userId: getId.id }
              }
            }
          ],
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

  static async calculateUserRoleSql(roleId, search) {
    const result = await models.Role.findById(roleId, {
      order: [[{ model: models.User, as: 'users' }, 'fullName', 'ASC']],
      include: [
        {
          model: models.User,
          as: 'users',
          attributes: ['email', 'fullName', 'userId', 'id', 'location'],
          through: { attributes: [] },
          required: false,
          where: {
            fullName: {
              [Op.iLike]: `%${search}%`
            }
          },
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

  static async getOneUserSql(req, id) {
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
        },
        {
          model: models.TravelReadinessDocuments,
          as: 'travelDocuments',
          attributes: ['id', 'type'],
        }
      ]
    });
    return result;
  }

  static async addOneUserSql(userData) {
    const userId = Utils.generateUniqueId();
    const [result] = await models.User.findOrCreate({
      where: {
        email: { ilike: userData.email }
      },
      defaults: {
        email: userData.email,
        userId,
        fullName: userData.name,
        passportName: userData.name,
        picture: userData.picture,
        manager: null,
        location: 'Nairobi'
      },
      include: [
        {
          model: models.Role,
          as: 'roles',
          attributes: ['roleName', 'description'],
          through: { attributes: [] }
        },
        {
          model: models.Department,
          as: 'budgetCheckerDepartments',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        }
      ]
    });
    return result;
  }
}

export default UserRoleUtils;
