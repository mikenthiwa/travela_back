import models from '../../database/models';
import CustomError from '../../helpers/Error';

export default class TravelStipendController {
  static async createTravelStipend(req, res) {
    try {
      const { stipend, center } = req.body;
      const { UserInfo: { id: createdBy } } = req.user;
      const { id: centerId, dataValues: { location } } = await models.Center.find({
        where: {
          location: center
        }
      });
      const newStipend = await models.TravelStipends.create(
        {
          amount: stipend,
          centerId,
          createdBy
        }
      );
      return res.status(201).json({
        success: true,
        message: `Successfully created a new travel stipend for ${location}`,
        stipend: newStipend
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getAllTravelStipends(req, res) {
    try {
      const stipends = await models.TravelStipends.findAll({
        
        include: [{
          model: models.User,
          as: 'creator',
          attributes: ['fullName', 'id']
        },
        {
          model: models.Center,
          as: 'center',
          attributes: ['location']
        }],
        attributes: ['id', 'amount']
      });
      return res.status(200).json({
        success: true,
        message: 'Travel Stipends retrieved successfully',
        stipends
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async deleteTravelStipend(req, res) {
    try {
      const travelStipendId = parseInt(req.params.id, 10);
      if (Number.isNaN(travelStipendId)) {
        return CustomError.handleError('Stipend id should be an integer', 400, res);
      }
      const foundTravelStipendId = await models.TravelStipends.findById(travelStipendId);
      if (!foundTravelStipendId) {
        return CustomError.handleError('Travel stipend does not exist', 404, res);
      }
      await foundTravelStipendId.destroy();
      return res.status(200).json({
        success: true,
        message: 'Travel Stipend deleted successfully'
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async getOneTravelStipend(req, res) {
    try {
      const { params: { id } } = req;

      const travelStipend = await models.TravelStipends.findById(id, {
        include: [
          {
            model: models.User,
            as: 'creator',
            attributes: [
              'id', 'fullName', 'email',
              'department'
            ]
          }
        ]
      });

      if (!travelStipend) {
        return res.status(404).json({
          success: false,
          error: 'Travel stipend does not exist'
        });
      }
      return res.status(200).json({
        success: true,
        travelStipend
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async updateTravelStipend(req, res) {
    try {
      const { params: { id } } = req;

      const { center, stipend } = req.body;

      const sanitizedStipend = Math.abs(Number(
        stipend
      ));

      const travelStipend = await models.TravelStipends.findById(id, {
        returning: true,
        include: [{
          model: models.User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email', 'department']
        }]
      });

      if (!travelStipend) {
        return res.status(404).json({
          success: false,
          error: 'Travel stipend does not exist'
        });
      }
      const { id: centerId } = await models.Center.find({
        where: {
          location: center
        }
      });

      await travelStipend.update({ centerId, amount: sanitizedStipend });

      return res.status(200).json({
        success: true,
        message: 'Travel stipend updated successfully',
        travelStipend
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }
}
