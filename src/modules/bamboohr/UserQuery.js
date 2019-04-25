import models from '../../database/models';

const {
  UserRole,
  User
} = models;

class UserQuery {
  static async createUser(userData) {
    const {
      id: bamboohrId,
      workEmail: email,
      firstName,
      lastName,
      department,
      supervisor: manager,
      gender,
      location
    } = userData;
    const dbResponse = await User.create({
      bambooHrId: bamboohrId,
      email,
      fullName: `${firstName} ${lastName}`,
      department,
      manager,
      userId: bamboohrId,
      gender,
      location
    });
    const { id } = dbResponse;
    await UserQuery.assignUserRole(id, 401938);
    return dbResponse;
  }

  static async assignUserRole(userId, roleId) {
    const dbResponse = await UserRole.create({
      userId,
      roleId,
    });
    return dbResponse;
  }

  static async getUser(bambooHrId) {
    const dbResponse = await User.findOne({
      where: {
        bambooHrId
      }
    });
    return dbResponse;
  }

  static async updateUser(userData) {
    const {
      id: bambooHrId,
      department,
      supervisor: manager,
      gender,
      location
    } = userData;
    const dbResponse = await User.update({
      department,
      manager,
      gender,
      location
    },
    {
      where: {
        bambooHrId
      }
    });
    return dbResponse;
  }
}

export default UserQuery;
