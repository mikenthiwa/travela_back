import Sequelize from 'sequelize';
import models from '../../database/models';
import Error from '../../helpers/Error';

const { Op } = Sequelize;

class HelpResourcesController {
  static async getHelpResources(req, res) {
    try {
      const helpResources = await models.HelpResources.findAll();
      return res.status(201).json({
        success: true,
        message: 'Help resources gotten successfully',
        helpResources
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async checkHasProtocol(address) {
    if (address.startsWith('http') || address.startsWith('https')) {
      return address.split('//').pop();
    } if (address.startsWith('www')) {
      return address.split(/\.(.+)/)[1];
    }
    return address;
  }

  static async checkResourceExists(link, address, addressWithoutProtocol) {
    const helplinkExists = await models.HelpResources.findOne({
      where: { link: { [Op.iLike]: link } }
    });

    const helpAddressExists = await models.HelpResources.findOne({
      where: { [Op.or]: [{ title: address }, { title: { [Op.iLike]: `%${addressWithoutProtocol}` } }] }
    });

    return {
      helpAddressExists,
      helplinkExists
    };
  }

  static async createHelpResources(req, res) {
    try {
      const { link, address } = req.body;
      if (!link || !address) {
        return res.status(400).json({
          request: req.body,
          success: false,
          message: 'Both link title and link addresses are required'
        });
      }
      
      const addressWithoutProtocol = await HelpResourcesController.checkHasProtocol(address);
      const { helpAddressExists, helplinkExists } = await HelpResourcesController.checkResourceExists(link, address, addressWithoutProtocol);

      if (helplinkExists) {
        return res.status(409).json({
          success: false,
          message: 'The link label already exists'

        });
      }

      if (helpAddressExists) {
        return res.status(409).json({
          success: false,
          message: 'The link address already exists'

        });
      }
      
      const result = await models.HelpResources.create({ link, title: address });
      return res.status(201).json({
        success: true,
        message: 'Resource created successfully',
        helpResources: result
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }
}

export default HelpResourcesController;
