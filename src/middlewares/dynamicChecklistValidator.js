import models from '../database/models';

export default class dynamicChecklistValidator {
  static async findExistingDestination(placesToValidate) {
    const { origin: { originModel, originAlias, originWhere }, destinations: { destinationsArray, destinationModel, destinationAlias } } = placesToValidate;
    const existingDestinations = [];
    await Promise.all(destinationsArray.map(async (destination) => {
      const checklist = await models.Checklist.findOne({
        paranoid: false,
        include: [{
          model: models.ChecklistOrigin,
          as: 'origin',
          include: [{
            model: models[originModel],
            as: originAlias,
            where: originWhere
          }]
        }, {
          model: models.ChecklistDestinations,
          as: 'destinations',
          include: [{
            model: models[destinationModel],
            as: destinationAlias,
            where: { [destinationAlias]: destination }
          }]
        }]
      });
      if (checklist) {
        existingDestinations.push(destination);
      }
    }));

    return existingDestinations;
  }

  static async validateChecklistOriginDestination(req, res, next) {
    const { origin: { country, region }, destinations: { countries, regions } } = req.body;

    const placesToValidate = {};

    if (country) {
      placesToValidate.origin = {
        originModel: 'Country',
        originAlias: 'country',
        originWhere: { country }
      };
    }

    if (region) {
      placesToValidate.origin = {
        originModel: 'TravelRegions',
        originAlias: 'region',
        originWhere: { region }
      };
    }

    if (countries) {
      placesToValidate.destinations = {
        destinationsArray: countries,
        destinationModel: 'Country',
        destinationAlias: 'country',
      };
    }

    if (regions) {
      placesToValidate.destinations = {
        destinationsArray: regions,
        destinationModel: 'TravelRegions',
        destinationAlias: 'region',
      };
    }
    
    const existingDestinations = await dynamicChecklistValidator.findExistingDestination(placesToValidate);
   
    if (existingDestinations.length) {
      return res.status(409).json({
        success: false,
        message: `${existingDestinations[0]} already exist as a destination to this origin`,
        errors: {
          destinations: {
            message: 'Some of the destinations already exist',
            meta: {
              destinations: existingDestinations,
              origin: country || region
            }
          }
        }
      });
    }
    return next();
  }

  static validateChecklistRequest(req, res, next) {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({
        success: false,
        message: 'req.body must contains origin, destinations and config keys',
      });
    }

    const reqBodyKeys = ['origin', 'destinations', 'config'];
    
    reqBodyKeys.forEach((item) => {
      if (!Object.prototype.hasOwnProperty.call(req.body, item)) {
        return res.status(400).json({
          success: false,
          message: 'req.body must contains only origin, destinations and config keys',
        });
      }
    });
    

    const { origin: { country, region }, destinations: { countries, regions }, config } = req.body;
  
    let valid = true;
    let message;
    let originCheck;

    const validateArrayItem = (arr, type) => arr.forEach((item) => {
      if (!item.trim().length) {
        valid = false;
        message = `${type} array should not contain empty string`;
      }
    });

    if (!Object.keys(req.body.origin).length) {
      valid = false;
      message = 'Origin object must contain country or region key';
    }

    Object.keys(req.body.origin).forEach((item) => {
      if (item === 'country') {
        originCheck = country;
        if (!country.trim().length) {
          valid = false;
          message = 'Origin(Country) must be present';
        }
      }

      if (item === 'region') {
        originCheck = region;
        if (!region.trim().length) {
          valid = false;
          message = 'Origin(Region) must be present';
        }
      }

      if (item !== 'region' && item !== 'country') {
        valid = false;
        message = `Origin must contain country or region as keys: ${item} is an invalid key`;
      }
    });

    Object.keys(req.body.destinations).forEach((item) => {
      if (item === 'countries') {
        if (!countries.length) {
          valid = false;
          message = 'Destination must contain countries';
        }
        validateArrayItem(countries, 'Countries');
        
        if (countries.includes(originCheck)) {
          valid = false;
          message = 'Origin cannot be in the destination';
        }
      }

      if (item === 'regions') {
        if (!regions.length) {
          valid = false;
          message = 'Destination must contain regions';
        }
        validateArrayItem(regions, 'Regions');
  
        if (regions.includes(originCheck)) {
          valid = false;
          message = 'Origin cannot be in the destination';
        }
      }

      if (item !== 'regions' && item !== 'countries') {
        valid = false;
        message = `Destinations must contain countries or regions as keys: ${item} is an invalid key`;
      }
    });

    if (!config || !config.length) {
      valid = false;
      message = 'Config must be present';
    }

    config.forEach((item) => {
      if (typeof item !== 'object') {
        valid = false;
        message = 'Config value must be an object';
      }
    });

    if (!valid) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return next();
  }
}
