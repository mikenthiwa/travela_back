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
}

export default WizardUtils;
