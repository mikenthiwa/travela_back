import models from '../../database/models';
import CustomError from '../../helpers/Error';
import UserRoleController from './UserRoleController';

class UpdateUserRoleController {
  static async updateRole(req, res) {
    const { params: { id }, body: { roleName, description } } = req;
    try {
      const getRoleId = await models.Role.findOne({
        attributes: ['id'],
        where: { id },
        raw: true
      });
      if (!getRoleId) {
        const result = [];
        const message = [404, 'User role with that Id does not exist', false];
        return UserRoleController.response(res, message, result);
      }
      const result = await models.Role.update(
        { roleName, description },
        {
          returning: true,
          where: { id: getRoleId.id }
        }
      );
      const message = [200, 'User role updated successfully', true];
      UserRoleController.response(res, message, result);
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError(error, 500, res);
    }
  }
}

export default UpdateUserRoleController;
