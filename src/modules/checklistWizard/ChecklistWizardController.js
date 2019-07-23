import models from '../../database/models';
import WizardUtils from './wizardUtils';
import Error from '../../helpers/Error';

class ChecklistWizardController {
  static async createChecklist(req, res) {
    try {
      const newChecklist = await models.Checklist.create({
        createdBy: req.user.UserInfo.id,
        name: WizardUtils.generateName(req.body.origin, req.body.destinations),
        config: req.body.config,
      }, {
        returning: true,
        include: [{
          model: models.ChecklistOrigin,
          as: 'origin',
          include: [{
            model: models.Country,
            as: 'country'
          }, {
            model: models.TravelRegions,
            as: 'region'
          }]
        }, {
          model: models.ChecklistDestinations,
          as: 'destinations',
          include: [{
            model: models.Country,
            as: 'country'
          }, {
            model: models.TravelRegions,
            as: 'region'
          }]
        }]
      });

      const { country, region } = req.body.origin;

      await WizardUtils.savePlaces(newChecklist.id, country, region, 'ChecklistOrigin');

      const { countries, regions } = req.body.destinations;

      if (countries) {
        await Promise.all(countries.map(item => WizardUtils.savePlaces(newChecklist.id, item, undefined, 'ChecklistDestinations')));
      } else {
        await Promise.all(regions.map(item => WizardUtils.savePlaces(newChecklist.id, undefined, item, 'ChecklistDestinations')));
      }

      await newChecklist.reload();

      return res.status(201).json({
        success: true,
        message: 'Checklist created successfully',
        newChecklist
      });
    } catch (error) { /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }
}

export default ChecklistWizardController;
