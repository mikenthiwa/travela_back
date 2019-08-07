import shortid from 'shortid';
import models from '../../database/models';

class WizardUtils {
  static async savePlaces(checklistId, country, region, model = 'ChecklistOrigin') {
    if (country) {
      const countryOrigin = await models.Country
        .findOrCreate({ where: { country }, defaults: { regionId: 9999 } });
      const [origin] = countryOrigin;
          
      await models[model].create({
        checklistId,
        countryId: origin.id,
      });
    } else {
      const regionOrigin = await models.TravelRegions
        .findOrCreate({ where: { region }, defaults: { description: `${region} countries` } });
      const [origin] = regionOrigin;
  
      await models[model].create({
        checklistId,
        regionId: origin.id,
      });
    }
  }

  static generateName(origin, destinations) {
    const { countries, regions } = destinations;
    const originName = origin.country || origin.region;
    let desinationName;

    if (countries) {
      [desinationName] = countries;
    } else {
      [desinationName] = regions;
    }

    return `${originName}-${desinationName}`.trim();
  }

  static getChecklistByTrip(trips) {
    return new Promise((res, rej) => {
      const resultArray = [];
      let count = trips.length;
      const getChecklist = async ({ id: tripId, destination, origin }, index) => {
        try {
          const checklist = await models.Checklist.findOne({
            include: [
              {
                model: models.ChecklistDestinations,
                as: 'destinations',
                include: [{
                  model: models.Country,
                  as: 'country',
                  where: { country: destination.split(', ')[1] }
                }, {
                  model: models.TravelRegions,
                  as: 'region'
                }]
              },
              {
                model: models.ChecklistOrigin,
                as: 'origin',
                include: [{
                  model: models.Country,
                  as: 'country',
                  where: { country: origin.split(', ')[1] }
                }, {
                  model: models.TravelRegions,
                  as: 'region'
                }]
              }
            ],
          });
          const fakeObj = () => ({
            id: shortid.generate(),
            name: `${origin.split(', ')[1]}-${destination.split(', ')[1]}`,
            config: []
          });

          const newChecklist = checklist || fakeObj();
          resultArray[index] = { tripId, ...newChecklist };
          count -= 1;
          if (!count) return res(resultArray);
        } catch (error) { /* istanbul ignore next */
          rej(error);
        }
      };
      trips.forEach((trip, index) => getChecklist(trip, index));
    });
  }
}

export default WizardUtils;
