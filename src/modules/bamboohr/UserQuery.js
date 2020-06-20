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
      jobTitle: occupation,
      supervisor: manager,
      gender,
      location
    } = userData;
    const dbResponse = await User.create({
      bambooHrId: bamboohrId,
      email,
      fullName: `${firstName} ${lastName}`,
      passportName: `${firstName} ${lastName}`,
      department,
      manager,
      occupation,
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

  static async getUser(email) {
    const dbResponse = await User.findOne({
      where: {
        email
      }
    });
    return dbResponse;
  }

  static async updateUser(userData) {
    const {
      id: bambooHrId,
      workEmail: email,
      department,
      supervisor: manager,
      gender,
      location,
      jobTitle: occupation
    } = userData;
    const dbResponse = await User.update({
      department,
      manager,
      gender,
      location,
      occupation,
      bambooHrId,
      userId: bambooHrId
    },
    {
      where: {
        email
      }
    });
    return dbResponse;
  }

  static async flagDeletedUser(userData) {
    const {
      id: bambooHrId,
    } = userData;
    const dbResponse = await User.destroy({
      where: {
        bambooHrId
      }
    });
    return dbResponse;
  }

  static async createOrUpdate(userData) {
    const {
      workEmail: email
    } = userData;
    let dbResponse;
    const user = await UserQuery.getUser(email);
    if (user) {
      dbResponse = await UserQuery.updateUser(userData);
    }
    dbResponse = await UserQuery.createUser(userData);
    return dbResponse;
  }
}

export default UserQuery;
