import models from '../database/models';

class Centers {
  static async getCenter(locationQuery) {
    const [city] = locationQuery.split(',');
    const cityRegex = new RegExp(`^${city},`);
    const centers = await models.Center.findAll({
      raw: true,
      attributes: ['location']
    });
    let center = centers.find(data => cityRegex.test(data.location));
    if (!center) center = { location: '' };
    return center.location;
  }

  static async getDestinationCenters(requestId) {
    const trips = await models.Trip.findAll({ where: { requestId } });
    const destination = trips.map(trip => trip.destination);
    
    const centers = destination.map(async (location) => {
      const country = location.split(', ').pop();
      const center = await models.Center.findOne({ where: { location: country } });
      if (center) return center.id;
    });

    const centerIds = await Promise.all(centers);
    return centerIds;
  }
}

export default Centers;
