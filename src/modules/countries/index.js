import express from 'express';
import middlewares from '../../middlewares';
import countriesController from './countriesController';

const Router = express.Router();
const {
  authenticate,
  RoleValidator,
  CountryValidator
} = middlewares;

Router.post(
  '/regions/:regionId/countries',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  CountryValidator.regionExistsValidation,
  CountryValidator.inputValidation,
  CountryValidator.countryExistsValidation,
  countriesController.addCountry
);
Router.get(
  '/regions/:regionId/countries',
  authenticate,
  RoleValidator.checkUserRole([
    'Super Administrator',
    'Travel Administrator',
    'Travel Team Member'
  ]),
  CountryValidator.regionExistsValidation,
  countriesController.getCountries
);
export default Router;
