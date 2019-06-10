import models from '../../database/models';

class FlightEstimatesQuery {
  static async getEstimatesByCountry(origins, destinations) {
    const dbResponse = await models.FlightEstimate.findAll({
      attributes: [
        'id',
        'amount',
        'originCountry',
        'destinationCountry',
      ],
      where: {
        originCountry: origins,
        destinationCountry: destinations
      }
    });
    return dbResponse;
  }
}

export default FlightEstimatesQuery;
