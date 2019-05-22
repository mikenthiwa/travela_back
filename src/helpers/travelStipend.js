import models from '../database/models';

class TravelStipend {
  static async getStipendsByLocation(locations) {
    const dbResponse = await models.TravelStipends.findAll({
      raw: true,
      where: {
        country: [...locations]
      },
      attributes: [
        'id',
        'amount',
        'country'
      ],
    });
    return dbResponse;
  }

  static async getDefaultStipend() {
    const [defaultStipend] = await TravelStipend.getStipendsByLocation(['Default']);
    return defaultStipend;
  }

  static async findStipendById(id) {
    const travelStipend = await models.TravelStipends.findById(id, {
      returning: true,
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

    return travelStipend;
  }

  static async checkTravelStipend(foundStipend, locations) {
    const stipendCountry = [
      ...new Set(foundStipend.map(stipend => stipend.country))
    ];
    const defaultStipend = await TravelStipend.getDefaultStipend();
    const uniqueLocations = [...new Set(locations)];
    const differenceDestinations = uniqueLocations.filter(
      location => !stipendCountry.includes(location)
    );

    if (differenceDestinations.length && defaultStipend) {
      differenceDestinations.map((destination) => {
        const newStipend = {
          id: defaultStipend.id,
          amount: defaultStipend.amount,
          country: destination
        };
        return foundStipend.push(newStipend);
      });
    }

    return foundStipend;
  }
}

export default TravelStipend;
