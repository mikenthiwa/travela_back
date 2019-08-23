/* eslint-disable no-await-in-loop */
import models from '../../database/models';
import WizardUtils from './wizardUtils';
import Error from '../../helpers/Error';
import TripsController from '../trips/TripsController';
import Utils from '../../helpers/Utils';

class ChecklistWizardController {
  static async createChecklist(req, res) {
    try {
      const newChecklist = await models.Checklist.create(
        {
          createdBy: req.user.UserInfo.id,
          name: WizardUtils.generateName(
            req.body.origin,
            req.body.destinations
          ),
          config: req.body.config
        },
        {
          returning: true,
          include: [
            {
              model: models.ChecklistOrigin,
              as: 'origin',
              include: [
                {
                  model: models.Country,
                  as: 'country'
                },
                {
                  model: models.TravelRegions,
                  as: 'region'
                }
              ]
            },
            {
              model: models.ChecklistDestinations,
              as: 'destinations',
              include: [
                {
                  model: models.Country,
                  as: 'country'
                },
                {
                  model: models.TravelRegions,
                  as: 'region'
                }
              ]
            }
          ]
        }
      );

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
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async getAllChecklists(req, res) {
    try {
      const checklists = await WizardUtils.getAllChecklists(false);

      return res.status(200).json({
        success: true,
        checklists
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async getDeletedChecklists(req, res) {
    try {
      const checklists = await WizardUtils.getAllChecklists(true);

      return res.status(200).json({
        success: true,
        checklists
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async getSingleChecklist(req, res) {
    const {
      params: { checklistId }
    } = req;
    try {
      const checklist = await WizardUtils.getSingleChecklist(
        checklistId,
        false
      );
      if (checklist) {
        return res.status(200).json({
          success: true,
          checklist: {
            origin: checklist.origin,
            destinations: checklist.destinations,
            config: checklist.config
          }
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Checklist item not found'
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async updateChecklist(req, res) {
    const {
      params: { checklistId }
    } = req;

    const { origin, destinations, config } = req.body;
    const { country, region } = origin;
    const { countries, regions } = destinations;

    try {
      const checklist = await WizardUtils.updateChecklist(
        checklistId,
        country,
        region,
        countries,
        regions
      );

      const { error } = checklist;

      if (error) {
        return res
          .status(error.status)
          .json({ success: false, message: error.msg });
      }
      const newChecklistName = await WizardUtils.generateName(origin, destinations);

      await models.Checklist.update(
        {
          name: newChecklistName,
          config
        },
        { where: { id: checklistId } }
      );

      return res.status(200).json({
        success: true,
        message: 'Checklist updated successfully'
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async deleteChecklist(req, res) {
    const {
      params: { checklistId }
    } = req;

    try {
      const { error, checklist } = await WizardUtils.deleteChecklist(
        checklistId
      );

      if (error) {
        return res
          .status(error.status)
          .json({ success: false, message: error.msg });
      }
      return res.status(200).json({
        success: true,
        message: 'Checklist deleted successfully',
        checklist
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async restoreDeletedChecklist(req, res) {
    const {
      params: { checklistId }
    } = req;

    try {
      const checklist = await WizardUtils.getSingleChecklist(checklistId, true);

      if (!checklist) {
        return res
          .status(404)
          .json({ success: false, message: 'Checklist item not found' });
      }

      await models.Checklist.update(
        { deletedAt: null },
        { where: { id: checklistId }, paranoid: false }
      );
      return res.status(200).json({
        success: true,
        message: 'Checklist restored successfully'
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async getChecklistByRequest(req, res) {
    try {
      const { requestId } = req.params;
    
      const trips = await TripsController.getTripsByRequestId(requestId, res);
      const row = await WizardUtils.getChecklistByTrip(trips);

      const checklists = row.map(checklist => ({
        tripId: checklist.tripId,
        id: checklist.id,
        name: checklist.name,
        config: checklist.config,
        ...checklist.dataValues
      }));
  
      res.status(200).json({
        success: true,
        message: 'Successfully retrieved checklist',
        checklist: {
          id: Utils.generateUniqueId(),
          isSubmitted: false,
          notifications: {},
          checklists,
          trips,
          updatedAt: new Date().toISOString(),
        }
      });
    } catch (error) { /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }
  
  static async restoreAllDeletedChecklist(req, res) {
    const response = await models.Checklist.update(
      { deletedAt: null },
      { where: { deletedAt: { ne: null } }, paranoid: false }
    );

    if (response < 1) {
      return res.status(404).json({
        success: false,
        message: 'There is no deleted checklist at the moment'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'All checklists restored successfully'
    });
  }
}

export default ChecklistWizardController;
