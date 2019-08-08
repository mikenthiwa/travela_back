import shortid from 'shortid';
import models from '../../database/models';
import circularReplacer from '../../helpers/circularReplacer';

class WizardUtils {
  static async savePlaces(
    checklistId,
    country,
    region,
    model = 'ChecklistOrigin'
  ) {
    if (country) {
      const countryOrigin = await models.Country.findOrCreate({
        where: { country },
        defaults: { regionId: 9999 }
      });
      const [origin] = countryOrigin;

      await models[model].create({
        checklistId,
        countryId: origin.id
      });
    } else {
      const regionOrigin = await models.TravelRegions.findOrCreate({
        where: { region },
        defaults: { description: `${region} countries` }
      });
      const [origin] = regionOrigin;

      await models[model].create({
        checklistId,
        regionId: origin.id
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
  
  static async checklistQuery() {
    const query = [
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
      },
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
        model: models.User,
        as: 'user'
      }
    ];
    return query;
  }

  static async getAllChecklists(isDeleted) {
    const query = await this.checklistQuery();
    const whereQuery = { deletedAt: { ne: null } };
    const checkWhereQuery = isDeleted ? whereQuery : null;
    const row = await models.Checklist.findAll({
      attributes: { exclude: ['createdBy'] },
      paranoid: isDeleted ? false : true, // eslint-disable-line no-unneeded-ternary
      where: checkWhereQuery,
      include: query
    });

    const removeCyclicStructure = JSON.stringify(row, circularReplacer());
    const newRow = JSON.parse(removeCyclicStructure);
    const checklists = newRow.map((checklist) => {
      const { user, ...rest } = checklist;
      return {
        ...rest,
        createdBy: user
      };
    });
    return checklists;
  }

  static async getSingleChecklist(checklistId, isDeleted) {
    const query = await this.checklistQuery();
    const checklist = await models.Checklist.findOne({
      attributes: ['id', 'config'],
      paranoid: isDeleted ? false : null,
      where: { id: checklistId },
      include: query
    });
    return checklist;
  }

  static async updateChecklist(
    checklistId,
    country,
    region,
    countries,
    regions
  ) {
    const checklist = await this.getSingleChecklist(checklistId, false);
    if (checklist) {
      if (country) {
        await models.ChecklistOrigin.destroy({
          where: { checklistId }
        });

        await this.savePlaces(checklistId, country, region, 'ChecklistOrigin');
      }

      if (countries) {
        await models.ChecklistDestinations.destroy({
          where: { checklistId }
        });

        await Promise.all(countries.map(item => this.savePlaces(checklistId, item, undefined, 'ChecklistDestinations')));
      } else {
        await models.ChecklistDestinations.destroy({
          where: { checklistId }
        });

        await Promise.all(regions.map(item => this.savePlaces(checklistId, undefined, item, 'ChecklistDestinations')));
      }
      return checklist;
    }
    return { error: { status: 404, msg: 'Checklist item not found' } };
  }

  static async deleteChecklist(checklistId) {
    const checklist = await this.getSingleChecklist(checklistId, false);
    if (checklist) {
      await models.Checklist.destroy({
        where: { id: checklistId }
      });
      return checklist;
    }
    return { error: { status: 404, msg: 'Checklist item not found' } };
  }
}

export default WizardUtils;
