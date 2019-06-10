import CustomError from '../../helpers/Error';
import TravelStipendController from '../travelStipend/TravelStipendController';
import HotelEstimateController from '../hotelEstimate/HotelEstimateController';
import flightCostsQuery from './FlightEstimatesQuery';

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
    const origins = TravelCostsController.getLocationOrigins(locations);
    const destinations = TravelCostsController.getLocationDestinations(locations);
    const flightEstimates = await flightCostsQuery.getEstimatesByCountry(origins, destinations);

    return flightEstimates.map(flightEstimate => ({
      origin: flightEstimate.originCountry,
      destination: flightEstimate.destinationCountry,
      cost: flightEstimate.amount
    }));
  }

  static async getHotelEstimates(locations) {
    return HotelEstimateController.getHotelEstimatesByLocations(locations);
  }

  static getLocationDestinations(locations) {
    const parsedLocations = TravelCostsController.parseLocationString(locations);
    return parsedLocations.map(location => location.destination.split(', ')[1]);
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
}
