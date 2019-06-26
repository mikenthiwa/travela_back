/* eslint object-property-newline: 0 */
import _ from 'lodash';
import { Op } from 'sequelize';
import models from '../../database/models';
import TripsController from '../../modules/trips/TripsController';
import TravelChecklistController from '../../modules/travelChecklist/TravelChecklistController';
import CustomError from '../Error';
import { getTravelDocument } from '../../modules/travelReadinessDocuments/getTravelDocument.data';

class TravelChecklistHelper {
  static groupCheckList(checklists, groupBy) {
    const modifiedChecklist = checklists.reduce((groupedList, item) => {
      const newGroup = groupedList;
      const val = item[groupBy];
      newGroup[val] = newGroup[val] || [];
      newGroup[val].push(item);
      return newGroup;
    }, {});
    const groupedCheckList = Object.keys(modifiedChecklist).map(key => ({
      [groupBy]: key,
      checklist: modifiedChecklist[key]
    }));
    return groupedCheckList;
  }

  static addTripIds(checklists, tripsDestinationsWithId) {
    const uniqueTrips = _.uniqBy(
      tripsDestinationsWithId, trip => trip.destination
    );

    const checklistWithTripId = checklists.map((checklist) => {
      const { destinationName } = checklist;
      const destinationTrip = uniqueTrips
        .find(trip => trip.destination.split(', ')[1] === destinationName);
      return {
        ...checklist, tripId: destinationTrip.id,
        tripLocation: destinationTrip.destination,
        tripOrigin: destinationTrip.origin.split(', ')[1]
      };
    });
    return checklistWithTripId;
  }

  static addDefaultItems(checklists) {
    const travelTicket = checklists.find(
      checklist => checklist.destinationName.toLowerCase().match('default')
    );

    const checkList = checklists.filter(
      checklist => !checklist.destinationName.toLowerCase().match('default')
    );

    if (!travelTicket || !checkList.length) return checklists;
    const checklistWithDefaultItem = checkList.map(
      checklist => ({
        ...checklist,
        checklist: [...checklist.checklist, ...travelTicket.checklist.reverse()]
      })
    );
    return checklistWithDefaultItem;
  }


  static addDestinationsWithNoChecklist(groupedChecklists, tripsDestinations) {
    const uniqueDestinations = [...new Set(tripsDestinations)];
    const destinationsWithChecklists = groupedChecklists
      .map(checklist => checklist.destinationName);

    const destinationsWithNoChecklist = [];
    uniqueDestinations.forEach((destination) => {
      if (!destinationsWithChecklists.includes(destination)) {
        destinationsWithNoChecklist
          .push({ destinationName: destination, checklist: [] });
      }
    });

    return [...groupedChecklists, ...destinationsWithNoChecklist];
  }

  static async getChecklistFromDb(query, res) {
    try {
      const checklists = await models.ChecklistItem.findAll(query);
      const groupedCheckLists = TravelChecklistHelper
        .groupCheckList(checklists, 'destinationName');
      return groupedCheckLists;
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError('Server Error', 500, res);
    }
  }

  static async modifyChecklistStructure(
    groupedCheckLists, tripsDestination, tripsDestinationsWithId
  ) {
    const newChecklist = TravelChecklistHelper
      .addDestinationsWithNoChecklist(groupedCheckLists, tripsDestination);
    let modifiedChecklist = TravelChecklistHelper
      .addDefaultItems(newChecklist);
    if (tripsDestinationsWithId.length) {
      modifiedChecklist = TravelChecklistHelper
        .addTripIds(modifiedChecklist, tripsDestinationsWithId);
    }
    return modifiedChecklist;
  }

  static async getChecklists(req, res, requestID = null, location = null) {
    try {
      const { requestId, destinationName } = req.query;
      let where = {};
      const tripsDestination = [];
      const tripsDestinationsWithId = [];
      const reqId = requestId || requestID;
      if (reqId) {
        const trips = await TripsController.getTripsByRequestId(reqId, res);
        trips.forEach((trip) => {
          const { id, destination, origin } = trip;
          tripsDestinationsWithId.push({ id, origin, destination });
          tripsDestination.push(destination.split(', ')[1]);
        });
        where = { destinationName: [...tripsDestination, 'Default'] };
      } else if (destinationName) {
        const andelaCenters = await TravelChecklistHelper.getAndelaCenters();
        const destinationNames = (destinationName.split(',')).map(center => (andelaCenters[center]));
        where = { destinationName: { [Op.or]: [...destinationNames, 'Default'] } };
      }
      const query = {
        where, attributes: ['id', 'name', 'requiresFiles',
          'destinationName', 'deleteReason'], order: [['destinationName', 'ASC']],
        include: [{
          model: models.ChecklistItemResource, as: 'resources',
          attributes: ['id', 'label', 'link', 'checklistItemId']
        }]
      };
      const groupedChecklists = await TravelChecklistHelper.getChecklistFromDb(query, res);
      const filteredGroupedChecklists = groupedChecklists.filter(item => item.destinationName !== location);
      const checklists = groupedChecklists.length
        ? TravelChecklistHelper.modifyChecklistStructure(
          filteredGroupedChecklists, tripsDestination, tripsDestinationsWithId
        ) : [];
      return checklists;
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async getAndelaCenters() {
    const andelaCenters = await models.Center.findAll();
    const allCenters = {};
    andelaCenters.forEach((center) => {
      allCenters[center.dataValues.location.split(',', 1)] = center.dataValues.location;
    });
    return allCenters;
  }

  static combineSubmittedChecklists(travelCheckLists, submissions) {
    const combinedChecklist = travelCheckLists.map((travelChecklist) => {
      const checklistWithSubmissions = travelChecklist.checklist.map((checklist) => {
        const { id } = checklist;
        const foundSubmission = submissions
          .filter(submission => (submission.tripId === travelChecklist.tripId
            && submission.checklistSubmissions.id === id));

        return {
          ...checklist,
          submissions: foundSubmission
        };
      });

      return {
        ...travelChecklist,
        checklist: checklistWithSubmissions
      };
    });
    return combinedChecklist;
  }

  static generateChecklistValue(id, retrievedDoc, file) {
    const value = id ? {
      url: retrievedDoc.cloudinaryUrl,
      fileName: retrievedDoc.imageName
    } : file;
    return value;
  }

  static async retrieveTravelDocumentData(documentId) {
    const document = await getTravelDocument(documentId, models);
    const retrievedDoc = document ? document.dataValues.data : null;
    return retrievedDoc;
  }

  static async getDeletedChecklist(req) {
    const { destinationName } = req.query;
    const andelaCenters = await TravelChecklistHelper.getAndelaCenters();
    /* istanbul ignore next */
    const ChecklistItems = await models.ChecklistItem
      .findAll({
        paranoid: false,
        where: {
          deletedAt: {
            [Op.ne]: null
          },
          destinationName: andelaCenters[`${destinationName}`]
        },
        include: {
          model: models.ChecklistItemResource,
          as: 'resources',
          paranoid: false,
          attributes: ['id', 'label', 'link', 'checklistItemId']
        }/* istanbul ignore next */
      });
    /* istanbul ignore next */
    if (ChecklistItems.length) return { deletedTravelChecklists: ChecklistItems };
    const errorMsg = 'There are currently no deleted travel checklist items for your location'; // eslint-disable-line
    return { error: { msg: errorMsg, status: 404 } };
  }

  static async getTravelSubmissions(requestId, res) {
    const request = await TravelChecklistController
      .getApprovedRequest('Approved', requestId, res);
    let where = {};
    let submissions = [];
    const trips = await TripsController.getTripsByRequestId(requestId, res);
    const tripsId = trips.map(trip => trip.id);
    where = {
      tripId: { [Op.in]: tripsId }
    };

    if (request) {
      submissions = await models.ChecklistSubmission.findAll({
        where,
        include: [{
          model: models.ChecklistItem,
          as: 'checklistSubmissions',
          attributes: ['id']
        },
        {
          model: models.TravelReadinessDocuments,
          as: 'documentSubmission',
          attributes: ['id', 'data']
        }]
      });
    }
    return submissions;
  }
}

export default TravelChecklistHelper;
