import moment from 'moment';
import Validator from './Validator';
import CustomError from '../helpers/Error';
import models from '../database/models';
import {
  urlCheck, checkDate, checkImageUrl, checkName
} from '../helpers/reg';

const { Op } = models.Sequelize;

export default class travelReadinessDocumentsValidator {
  static validateVisa(req, res, next) {
    req
      .checkBody('visa.country', 'country should be provided')
      .notEmpty()
      .ltrim();
    req
      .checkBody('visa.entryType', 'entryType is either Single or Multiple')
      .custom(entryType => entryType === 'Single' || entryType === 'Multiple');
    travelReadinessDocumentsValidator.validateDateWithExpiry(req, 'visa');
    req
      .checkBody('visa.cloudinaryUrl', 'url is invalid')
      .notEmpty()
      .matches(urlCheck);
    req
      .checkBody('visa.visaType', 'visaType is either Business or Tourist or Other')
      .custom(visaType => visaType === 'Business' || visaType === 'Tourist' || visaType === 'Other');
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static documentExistsError(res, req) {
    let document = 'visa';
    let message = `You already have a ${document} for this country with the same expiry date`;
    if (req.body.passport) {
      document = 'passport';
      message = `You already have a ${document} with the same number`;
    } else if (req.body.other) {
      document = 'document';
      message = `You already have a ${document} with the same name`;
    }
    return res.status(409).json({
      success: false,
      message: 'validation error',
      errors: [
        { message }
      ]
    });
  }

  static validateInput(req, res, next) {
    const validTypes = ['other', 'visa', 'passport'];
    const isType = Object.keys(req.body).filter(type => validTypes.includes(type)).length;
    if (!isType) {
      return CustomError.handleError('Please provide a valid document type', 400, res);
    }

    if (req.body.passport) {
      const isValidDate = date => moment(date, 'MM/DD/YYYY', true).isValid();
      const { dateOfIssue } = req.body.passport;
      req
        .checkBody('passport.name', 'name is required')
        .notEmpty()
        .ltrim();
      req
        .checkBody('passport.passportNumber', 'passport is required')
        .notEmpty()
        .ltrim();
      req
        .checkBody('passport.nationality', 'nationality is required')
        .notEmpty()
        .ltrim();
      req
        .checkBody('passport.dateOfBirth', 'dateOfBirth is required')
        .notEmpty()
        .ltrim();
      req
        .checkBody('passport.dateOfIssue', 'dateOfIssue is required')
        .notEmpty()
        .ltrim();
      req
        .checkBody('passport.placeOfIssue', 'placeOfIssue is required')
        .notEmpty()
        .ltrim();
      req
        .checkBody('passport.expiryDate', 'expiryDate is required')
        .notEmpty()
        .ltrim();
      req
        .checkBody('passport.expiryDate', 'expiry date cannot be before date of issue')
        .isAfter(dateOfIssue);
      req
        .checkBody('passport.cloudinaryUrl', 'cloudinaryUrl is required')
        .notEmpty()
        .ltrim();
      req
        .checkBody('passport.passportNumber', 'passport number is not valid')
        .custom((passportNumber) => {
          const checkPassportNum = checkName.test(passportNumber);
          if (checkPassportNum || !passportNumber) {
            return Promise.reject(new Error());
          }
        });
      req
        .checkBody('passport.cloudinaryUrl', 'cloudinaryUrl is not a valid url')
        .custom((cloudinaryUrl) => {
          const checkUrl = checkImageUrl.test(cloudinaryUrl);
          if (checkUrl || !cloudinaryUrl) {
            return Promise.reject(new Error());
          }
        });
      req
        .checkBody(
          'passport.dateOfBirth',
          'The date of birth format you provided is not valid, use: MM/DD/YYYY'
        )
        .custom((birthDate) => {
          if (isValidDate(birthDate) || !birthDate) {
            return Promise.reject(new Error());
          }
        });
      req
        .checkBody(
          'passport.dateOfIssue',
          'The date of issue format you provided is not valid, use: MM/DD/YYYY'
        )
        .custom((issueDate) => {
          if (isValidDate(issueDate) || !issueDate) {
            return Promise.reject(new Error());
          }
        });
      req
        .checkBody(
          'passport.expiryDate',
          'The date of issue format you provided is not valid, use: MM/DD/YYYY'
        )
        .custom((dateOfExpiry) => {
          if (isValidDate(dateOfExpiry) || dateOfExpiry.length === 0) {
            return Promise.reject(new Error());
          }
        });

      const errors = req.validationErrors();
      Validator.errorHandler(res, errors, next);
    }
    if (req.body.visa) {
      travelReadinessDocumentsValidator.validateVisa(req, res, next);
    }
    if (req.body.other) {
      travelReadinessDocumentsValidator.validateOtherDocument(req, res, next);
    }
  }

  static async checkDocumentAndUser(req, res, next) {
    const { documentId } = req.params;
    const document = await models.TravelReadinessDocuments.findOne({
      where: { id: documentId }
    });

    if (document) {
      if (document.userId === req.user.UserInfo.id) {
        return next();
      }
      return res.status(403).json({ success: false, message: 'You don\'t have access to perform this action' });
    }

    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  static getWereClause(
    type,
    operation,
    fields,
    req,
  ) {
    const dataFields = fields.map(field => ({ [`data.${field}`]: req.body[type][field] }));
    const where = {
      [operation]: [
        ...dataFields,
        { userId: req.user.UserInfo.id },
        { type },
      ]
    };

    if (req.params.documentId) {
      where.id = {
        [Op.ne]: req.params.documentId
      };
    }
    return where;
  }

  static async findDocument(req) {
    let where;
    if (req.body.passport) {
      where = this.getWereClause('passport', Op.and, ['passportNumber'], req);
    } else if (req.body.other) {
      where = this.getWereClause('other', Op.and, ['name', 'expiryDate'], req);
    } else if (req.body.visa) {
      where = this.getWereClause('visa', Op.and, ['country', 'expiryDate'], req);
    }
    const document = await models.TravelReadinessDocuments.findOne({
      where,
    });
    return document;
  }

  static async validateUniqueDocument(req, res, next) {
    const document = await travelReadinessDocumentsValidator.findDocument(req);
    if (document) {
      return travelReadinessDocumentsValidator.documentExistsError(res, req);
    }
    next();
  }


  static validateOtherDocument(req, res, next) {
    if (req.body.other) {
      req.checkBody('other.name', 'document name should be provided').notEmpty().ltrim();
      req.checkBody(
        'other.name',
        'document that contains visa or passport keyword is not allowed in this category'
      )
        .custom((name) => {
          if (name === undefined) {
            return Promise.resolve();
          }
          if (name.match(/passport|visa/ig) === null) {
            return Promise.reject(new Error());
          }
        });
      req.checkBody('other.cloudinaryUrl', 'url is invalid').notEmpty()
        .matches(urlCheck);
      travelReadinessDocumentsValidator.validateDateWithExpiry(req, 'other');
      const errors = req.validationErrors();
      Validator.errorHandler(res, errors, next);
    }
  }


  static validateDateWithExpiry(req, type) {
    req.checkBody(`${type}.dateOfIssue`, 'issue date date must be provided in the form  mm/dd/yyyy')
      .custom((date) => {
        if (type === 'other' && !date) return true;
        return checkDate.test(date);
      });

    if (type !== 'other') {
      req.checkBody(
        `${type}.dateOfIssue`,
        'issue date date must be provided in the form  mm/dd/yyyy'
      )
        .notEmpty().ltrim().matches(checkDate);
    }

    req.checkBody(`${type}.expiryDate`, 'expiry date date must be provided in the form mm/dd/yyyy')
      .notEmpty().ltrim().matches(checkDate);
    req.checkBody(`${type}.expiryDate`, 'expiry date should be greater than date of issue')
      .custom((date) => {
        const expiryDate = new Date(date);
        const { dateOfIssue } = req.body[type];
        if (type === 'other' && !dateOfIssue) return true;
        const issueDate = new Date(dateOfIssue);
        return expiryDate > issueDate;
      });
  }
}
