import models from '../../database/models';
import Error from '../../helpers/Error';
import UserRoleController from '../userRole/UserRoleController';
import UserRoleUtils from '../userRole/UserRoleUtils';

class CentersController {
  static async createCenter(req, res) {
    try {
      const { newLocation } = req.body;
      const newCentre = await models.Center.create({ location: newLocation });
      return res.status(201).json({
        success: true,
        message: 'Successfully created a new centre',
        center: newCentre
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError('Server error', 500, res);
    }
  }

  static async getCenters(req, res) {
    try {
      const centers = await models.Center.findAll({
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json({
        success: true,
        message: 'Centres retrieved successfully',
        centers
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error, 500, res);
    }
  }

  static async changeCenter(req, res) {
    try {
      const {
        roleId,
        centerId,
        body: { email }
      } = req;
      const user = await UserRoleUtils.getUser(email);
      if (!user) {
        const message = 'Email does not exist';
        return Error.handleError(message, 404, res);
      }
      const hasRole = await models.UserRole.find({
        where: { roleId, userId: user.id }
      });
      const error = 'User does not have this role';
      if (!hasRole) return Error.handleError(error, 409, res);
      const query = { where: { userId: user.id, roleId } };
      await models.UserRole.destroy(query);
      const add = await UserRoleController.addMuftiCenter(centerId, user, roleId);
      return res.status(200).json({
        success: true,
        message: 'Centres updated successfully',
        add
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }
}

export default CentersController;
