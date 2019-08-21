import moment from 'moment';
import { convertIso3Code } from 'convert-country-codes';
import * as child from 'child_process';
import request from 'request';
import fs from 'fs';
import models from '../../database/models';
import CustomError from '../../helpers/Error';
import Utils from '../../helpers/Utils';
import NotificationEngine from '../notifications/NotificationEngine';
import TravelReadinessUtils from './TravelReadinessUtils';
import Pagination from '../../helpers/Pagination';
import UserRoleController from '../userRole/UserRoleController';
import RoleValidator from '../../middlewares/RoleValidator';
import { getTravelDocument, getSearchQuery } from './getTravelDocument.data';
import countries from '../../helpers/isoConstants';
import PassportOCR from '../../helpers/passportOcr';


export default class TravelReadinessController {
  static getDocumentType(req) {
    const documentTypes = {
      passport: 'passport',
      visa: 'visa',
      other: 'other'
    };
    const document = Object.keys(documentTypes).find(type => req.body[type]);
    return { document, documentTypes };
  }

  static trimData(documentData) {
    const dataValue = documentData;
    Object.keys(documentData)
      .forEach((key) => {
        dataValue[key] = dataValue[key].trim();
      });
    return dataValue;
  }

  static async addTravelReadinessDocument(req, res) {
    try {
      let newDocument;

      const { document, documentTypes } = TravelReadinessController.getDocumentType(req);
      if (document) {
        const data = req.body[document];
        const newData = { ...data };
        TravelReadinessController.trimData(newData);
        newDocument = {
          id: Utils.generateUniqueId(),
          type: document === 'other' ? data.name : documentTypes[document],
          data: newData,
          userId: req.user.UserInfo.id
        };
      }

      const addedDocument = await models.TravelReadinessDocuments.create(newDocument);
      res.status(201).json({
        success: true,
        message: 'document successfully added',
        addedDocument,
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getTravelReadinessDocument(req, res) {
    const { documentId } = req.params;
    try {
      const document = await getTravelDocument(documentId, models);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: `Document with id ${documentId} does not exist`,
        });
      }

      const handleResponse = () => {
        res.status(200).json({
          success: true,
          message: 'Document successfully fetched',
          document
        });
      };

      // check if logged in user/admin is the one requesting this resource
      if (req.user.UserInfo.id !== document.userId) {
        return RoleValidator.checkUserRole(
          ['Super Administrator', 'Travel Administrator', 'Travel Team Member']
        )(req, res, handleResponse);
      }

      return handleResponse();
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getAllUsersReadiness(req, res) {
    const { searchQuery, withDocuments } = req.query;
    const query = searchQuery ? await getSearchQuery(searchQuery) : {};
    try {
      const count = await models.User.count({
        where: query,
        include: [
          {
            model: models.TravelReadinessDocuments,
            as: 'travelDocuments',
            required: withDocuments === 'true',
          }
        ]
      });
      const { pageCount, currentPage, initialPage } = Pagination
        .getPaginationParams(req, count);
      const users = await models.User.findAll({
        where: query,
        ...initialPage,
        order: [
          ['fullName', 'ASC']
        ],
        include: [
          {
            model: models.TravelReadinessDocuments,
            as: 'travelDocuments',
            required: withDocuments === 'true',
          },
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Fetched users successfully',
        users,
        meta: {
          count,
          pageCount,
          currentPage,
        }
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getUserReadiness(req, res) {
    const { id } = req.params;
    try {
      const user = await models.User.findOne({
        where: { userId: id },
        include: [
          {
            model: models.TravelReadinessDocuments,
            as: 'travelDocuments',
          },
        ]
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User with id ${id} does not exist`,
        });
      }

      const userData = user.dataValues;
      const { travelDocuments } = userData;
      const readinessDocuments = {};

      travelDocuments.forEach((i) => {
        readinessDocuments[i.type] = readinessDocuments[i.type] || [];
        readinessDocuments[i.type].push(i);
      });
      userData.travelDocuments = readinessDocuments;

      return res.status(200).json({
        success: true,
        message: 'Fetched user readiness successfully',
        user,
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async verifyTravelReadinessDocuments(req, res) {
    try {
      const { documentId } = req.params;

      const travelReadiness = await getTravelDocument(documentId, models);

      if (!travelReadiness) {
        return res.status(404).json({
          success: false,
          message: 'Document does not exist',
        });
      }
      const recipient = await UserRoleController.getRecipient(null, travelReadiness.userId);
      travelReadiness.isVerified = true;
      travelReadiness.save();
      await TravelReadinessController.sendMailToUser(travelReadiness, recipient, req.user);
      return res.status(200).json({
        success: true,
        message: 'Document successfully verified',
        updatedDocument: travelReadiness,
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async sendMailToUser(details, user, travelAdmin) {
    const topic = 'Travel Readiness Document Verification';
    const type = 'Travel Readiness Document Verified';
    const mailData = await TravelReadinessUtils.getMailData(details, user, topic, type, travelAdmin);
    NotificationEngine.sendMail(mailData);
  }

  static async editTravelReadinessDocument(req, res) {
    try {
      const { documentId } = req.params;

      const foundDocument = await models.TravelReadinessDocuments.findOne({
        where: { id: documentId, isVerified: false, userId: req.user.UserInfo.id }
      });

      if (!foundDocument) {
        return res.status(403).json({
          success: false, message: 'You can no longer update this document',
        });
      }

      const { document, documentTypes } = await TravelReadinessController.getDocumentType(req);

      const data = req.body[document];
      const updateData = { ...data };
      TravelReadinessController.trimData(updateData);
      const documentUpdate = {
        type: document === 'other' ? data.name : documentTypes[document],
        data: updateData,
      };

      const updatedDocument = await foundDocument.update(documentUpdate);

      await TravelReadinessController.sendEditMailNotification(req.user.UserInfo, updatedDocument);
      res.status(200).json({
        success: true,
        message: 'document successfully updated',
        updatedDocument,
      });


      return null;
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async sendEditMailNotification(user, document) {
    // role id for travel team is 339458 and role id for travel admin role is 29187
    const { users: travelTeamMembers } = await UserRoleController.calculateUserRole(339458);
    const { users: travelAdmin } = await UserRoleController.calculateUserRole(29187);
    const usersToReceiveEmail = [...travelTeamMembers, ...travelAdmin];
    const topic = 'Travel Document Edit';
    const type = 'Edit Travel Document';
    const { id, type: documentType } = document;
    const redirectLink = `${process.env.REDIRECT_URL}/redirect/travel-readiness/${user.id}?id=${id}&type=${documentType}`;
    const details = { user };
    const data = {
      topic, type, redirectLink, details
    };
    if (usersToReceiveEmail.length) NotificationEngine.sendMailToMany(usersToReceiveEmail, data);
  }

  static async deleteTravelReadinessDocument(req, res) {
    try {
      const { documentId } = req.params;
      const { id, name, email } = req.user.UserInfo;

      const documentToBeDeleted = await models.TravelReadinessDocuments.findById(documentId);

      if (!documentToBeDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Document does not exist',
        });
      }

      if (documentToBeDeleted.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Document has already been verified',
        });
      }

      if (!documentToBeDeleted.isVerified && documentToBeDeleted.userId === id) {
        documentToBeDeleted.destroy();
        await TravelReadinessUtils.sendMailToTravelTeamMembers(name, email);
        return res.status(200).json({
          success: true,
          message: 'Document successfully deleted',
          deletedDocument: documentToBeDeleted
        });
      }

      return res.status(401).json({
        success: false,
        message: 'You are Unauthorized to delete this Document',
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async JsOCRSolution(imageLink, callback) {
    let newObject = {};
    try {
      const filename = imageLink.split('/').pop();
      const writeFile = fs.createWriteStream(filename);
      await request(imageLink).pipe(writeFile).on('close', async () => {
        await PassportOCR.runTesseractCommand(filename, (passportData) => {
          if (passportData === 'null') {
            return callback('null');
          }
          const {
            country, dateOfBirth, expiryDate,
            sex, names, surname, number,
          } = passportData;

          surname.replace(/</g, ' ');
          let countryName = convertIso3Code(country);
          let nationality = '';
          if (countryName) {
            const { iso2 } = countryName;
            const [countryInfo] = countries.filter(nation => nation.Code === iso2);
            nationality = countryInfo.Nationality;
            countryName = countryInfo.Country;
          } else {
            countryName = country;
          }
          const expires = moment(expiryDate, 'YYMMDD').format('MM/DD/YYYY');
          const dateOfIssue = moment(expires).subtract(10, 'year').format('MM/DD/YYYY');
          const birthDay = moment(dateOfBirth, 'YYMMDD').format('MM/DD/YYYY');

          const finalPassData = {
            country: countryName,
            names,
            number,
            birthDay,
            expires,
            dateOfIssue,
            nationality,
            sex,
            surname,
            imageLink,
          };
          newObject = finalPassData;
          return callback(newObject);
        });
      });
    } catch (error) {
      /* istanbul ignore next */
      return callback(error);
    }
  }

  static async PythonOCRSolution(imageLink, callback) {
    try {
      let newObject = {};
      const pythonProcess = await child.spawn('python3', [
        `${__dirname}/passport.py`,
        imageLink
      ]);
      await pythonProcess.stdout.on('data', (data) => {
        let passportData = data.toString('utf-8');
        passportData = ((((passportData.replace(/(\r\n|\n|\r)/gm, '')).replace(/False/g, false)).replace(/True/g, true)).replace(/'/g, '"'))
          .replace(/</g, '');
        if (passportData === 'null') {
          return callback('null');
        }

        if (!passportData.includes('country')) {
          return callback('empty');
        }
        let jsonPassport = JSON.parse(passportData);
        const {
          country, dateOfBirth, expire,
          sex, names, surname, number, validScore
        } = jsonPassport;

        let countryName = convertIso3Code(country);
        let nationality = '';
        if (countryName) {
          const { iso2 } = countryName;
          const [countryInfo] = countries.filter(nation => nation.Code === iso2);
          nationality = countryInfo.Nationality;
          countryName = countryInfo.Country;
        } else {
          countryName = country;
        }
        const expires = moment(expire, 'YYMMDD').format('MM/DD/YYYY');
        const dateOfIssue = moment(expires).subtract(10, 'year').format('MM/DD/YYYY');
        const birthDay = moment(dateOfBirth, 'YYMMDD').format('MM/DD/YYYY');
        jsonPassport = {
          country: countryName,
          names,
          number,
          birthDay,
          expires,
          dateOfIssue,
          nationality,
          validScore,
          sex,
          surname,
          imageLink
        };

        if (validScore < 40) {
          return callback('poor validity');
        }
        newObject = jsonPassport;
        return callback(newObject);
      });
    } catch (error) {
    /* istanbul ignore next */
      return error;
    }
  }

  static async envSpecific(solution, imageLink, callback) {
    if (solution === 'python') {
      await TravelReadinessController.PythonOCRSolution(imageLink, response => callback(response));
    } else {
      await TravelReadinessController.JsOCRSolution(imageLink, response => callback(response));
    }
  }

  static async scanOCRPassport(req, res) {
    try {
      const { imageLink } = req.body;
      await TravelReadinessController.envSpecific(process.env.OCRSOLUTION, imageLink, (dataReceived) => {
        if (dataReceived === 'null') {
          return res.status(400).json({
            success: false,
            message: 'Please upload a valid passport image and ensure the image is in landscape'
          });
        }
        if (dataReceived === 'empty') {
          return res.status(400).json({
            success: false,
            message: 'please upload a valid passport image'
          });
        }
        if (dataReceived === 'poor validity') {
          return res.status(400).json({
            success: false,
            message: 'Please provide a high resolution Image',
          });
        }
        return res.status(201).json({
          success: true,
          message: 'Passport succesfully scanned, kindly confirm the details',
          passportData: dataReceived
        });
      });
    } catch (error) {
    /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }
}
