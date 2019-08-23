import CustomError from '../../helpers/Error';
import TravelStipendController from '../travelStipend/TravelStipendController';
import HotelEstimateController from '../hotelEstimate/HotelEstimateController';
import FlightEstimateController from '../flightEstimate/FlightEstimateController';
import models from '../../database/models';

export default class TravelCostsController {
  static async getTravelCosts(req, res) {
    const { locations } = req.query;
    try {
      const travelStipends = await TravelCostsController.getTravelStipends(locations);
      const hotelEstimates = await TravelCostsController.getHotelEstimates(locations);

      const flightCosts = await TravelCostsController.getFlightCosts(locations);

      return res.status(200).json({
        success: true,
        message: 'Travel Costs retrieved successfully',
        hotelEstimates,
        travelStipends,
        flightCosts
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getTravelStipends(locations) {
    return TravelStipendController.getTravelStipendsByLocation(locations);
  }

  static async getFlightCosts(locations) {
    const allLocations = TravelCostsController.parseLocations(locations);
    
    const flightEstimates = await FlightEstimateController.allFlightEstimates();
    
    
    let allEstimates = [];
    let regionEstimates = [];
    allLocations.forEach((location, index, arr) => {
      const estimates = flightEstimates.filter(s => ((s.originCountry === location.origin.split(', ')[1]
      && s.destinationCountry === location.destination.split(', ')[1])));
      if (!estimates.length) { regionEstimates = regionEstimates.concat([arr[index]]); }
      allEstimates = [...allEstimates, ...estimates];
    });

    let newEstimates = [];
    if (regionEstimates.length) {
      const flightDetails = await TravelCostsController.addRegion(regionEstimates);
  
      flightDetails.forEach((location) => {
        const regEstimates = flightEstimates.filter(
          s => (s.originRegion === location.flightOriginRegion && s.destinationRegion === location.flightDestinationRegion)
          || (s.originCountry === location.origin.split(', ')[1] && s.destinationRegion === location.flightDestinationRegion)
          || (s.originRegion === location.flightOriginRegion && s.destinationCountry === location.destination.split(', ')[1])
        );
        if (regEstimates.length) { /* istanbul ignore next */
          newEstimates = [...newEstimates, { originCountry: location.origin.split(', ')[1], destinationCountry: location.destination.split(', ')[1], amount: regEstimates[0].amount }];
        }
      });
    }

    allEstimates = [...allEstimates, ...newEstimates];
    
    if (allEstimates.length) {
      return allEstimates.map(flightEstimate => ({
        origin: flightEstimate.originCountry,
        destination: flightEstimate.destinationCountry,
        cost: flightEstimate.amount
      }));
    }
    return [];
  }

  static async addRegion(regionEstimates) {
    const flightLocations = await regionEstimates.map(async (flight) => {
      const flightOriginRegion = await TravelCostsController.getOriginDetails(flight.origin.split(', ')[1]);
      const flightDestinationRegion = await TravelCostsController.getDestinationDetails(flight.destination.split(', ')[1]);
      const flightDetails = {
        origin: flight.origin, destination: flight.destination, flightOriginRegion, flightDestinationRegion
      };
      return flightDetails;
    });
    
    
    const resolvedflightDetails = await Promise.all(flightLocations);
    return resolvedflightDetails;
  }

  static async getHotelEstimates(locations) {
    return HotelEstimateController.getHotelEstimatesByLocations(locations);
  }

  static getLocationDestinations(locations) {
    const parsedLocations = TravelCostsController.parseLocationString(locations);
    return parsedLocations.map(location => location.destination.split(', ')[1]);
  }

  static parseLocations(locations) {
    const parsedLocations = TravelCostsController.parseLocationString(locations);
    return parsedLocations;
  }

  static getLocationOrigins(locations) {
    const parsedLocations = TravelCostsController.parseLocationString(locations);
    return parsedLocations.map(location => location.origin.split(', ')[1]);
  }

  static parseLocationString(locations) {
    return locations.map((location) => {
      const parsedLocation = JSON.parse(location);
      return parsedLocation;
    });
  }

  static async getOriginDetails(origins) {
    const country = await models.Country.findOne({
      include: [{
        model: models.TravelRegions,
        as: 'region'
      }],
      where: { country: origins }
    });
    if (country) {
      const { region: { region: originRegion } } = country;
      return originRegion;
    }
  }

  static async getDestinationDetails(destinations) {
    const country = await models.Country.findOne({
      include: [{
        model: models.TravelRegions,
        as: 'region'
      }],
      where: { country: destinations }
    });
    if (country) {
      const { region: { region: destinationRegion } } = country;
      return destinationRegion;
    }
  }
}
