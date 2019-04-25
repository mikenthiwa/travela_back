import debug from 'debug';
import Error from '../../helpers/Error';
import UserQuery from './UserQuery';

const logger = debug('log');
class BambooUserController {
  static async createUser(newUsersData) {
    logger(`Creating Users : ${newUsersData}`);
    try {
      newUsersData.forEach(async (userData) => {
        if (userData) await UserQuery.createUser(userData);
      });
    } catch (error) {
      /* istanbul ignore next */
      logger(`There was an error updating the users ${error.message}`);
    }
  }

  static async updateUser(existingUsersData) {
    logger(`Updating users : ${existingUsersData}`);
    try {
      existingUsersData.forEach(async (userData) => {
        if (userData) await UserQuery.updateUser(userData);
      });
    } catch (error) {
      /* istanbul ignore next */
      logger(`There was an error updating the users ${error.message}`);
    }
  }

  static async createOrUpdateUser(req, res) {
    const {
      newUsersData,
      existingUsersData
    } = req;
    logger(`Creating or Updating Users : ${existingUsersData} ${newUsersData}`);
    try {
      if (newUsersData) BambooUserController.createUser(newUsersData);
      if (existingUsersData) BambooUserController.updateUser(existingUsersData);
      return res.status(201).json({
        success: true,
        message: 'Successfully created or updated the user',
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError('Server error', 500, res);
    }
  }
}

export default BambooUserController;
