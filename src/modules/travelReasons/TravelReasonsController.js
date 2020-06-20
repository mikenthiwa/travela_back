
import models from '../../database/models';
import CustomError from '../../helpers/Error';
import Pagination from '../../helpers/Pagination';

export default class TravelReasonsController {
  static async returnTravelReason(res, travelReason, status = 200, message) {
    return res.status(status).json({
      success: true,
      message,
      travelReason
    });
  }

  static async createTravelReason(req, res) {
    try {
      const { user, title, description } = req.body;

      const lowerCaseTitle = title.toLowerCase();
      const newReason = await models.TravelReason.create({
        title: lowerCaseTitle,
        description,
        createdBy: user.id
      });

      const travelReason = {
        id: newReason.id,
        title: newReason.title,
        description: newReason.description,
        createdAt: newReason.createdAt,
        updatedAt: newReason.updatedAt,
        deletedAt: newReason.deletedAt,
        createdBy: newReason.createdBy,
        creator: {
          fullName: user.fullName,
          email: user.email,
          userId: user.userId
        }
      };

      return TravelReasonsController.returnTravelReason(
        res,
        travelReason,
        201,
        'Successfully created a travel reason'
      );
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getTravelReasons(req, res) {
    try {
      const { query: { page } } = req;
      const limit = req.query.limit && req.query.limit > 0 ? req.query.limit : 10;
      const { options } = Pagination;
      const { countOptions, findOptions } = options(req);
      const count = await models.TravelReason.count(countOptions);
      const pageCount = Math.ceil(count / limit);
      const currentPage = page < 1 || !page || pageCount === 0 ? 1 : Math.min(page, pageCount);
      const offset = limit * (currentPage - 1);
      const travelReasons = await models.TravelReason.findAll({
        ...findOptions, limit, offset, order: [['id', 'DESC']]
      });
      return res.status(200).json({
        success: true,
        message: 'success',
        metaData: {
          travelReasons,
          pagination: {
            pageCount,
            currentPage,
            count
          }
        }
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async deleteReason(req, res) {
    try {
      const { id } = req.params;
      const foundReason = await models.TravelReason.findById(id);
      await foundReason.destroy();
      return res.status(200).json({
        success: true,
        message: 'Travel Reason deleted successfully',
        deletedReason: foundReason
      });
    } catch (error) { /* istanbul ignore next */
      return CustomError.handleError('Server Error', 500, res);
    }
  }

  static async getTravelReason(req, res) {
    try {
      return TravelReasonsController
        .returnTravelReason(
          res,
          req.travelReason
        );
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async updateTravelReason(req, res) {
    try {
      const { travelReason, body: { title, description } } = req;

      await travelReason.update({
        title: title || travelReason.title,
        description:
          description || travelReason.description
      });

      return TravelReasonsController
        .returnTravelReason(
          res,
          req.travelReason,
          200,
          'Travel reason updated successfully'
        );
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }
}
