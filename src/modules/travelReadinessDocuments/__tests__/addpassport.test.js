import supertest from 'supertest';
import { spawn } from 'child_process';
import req from 'request';
import jsData from './__mock__/jsPassportData';
import countryPassData from './__mock__/CountryPassData';
import app from '../../../app';
import mockPassport from './__mock__/mockPassport';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import { documentTypes } from './__mocks__/index';

const request = supertest;


jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

jest.mock('request', () => jest.fn());


const mockPipe = () => {
  req.mockImplementation(imageLink => ({
    pipe: writeFile => ({
      on: (event, promise) => {
        promise({ writeFile, imageLink });
        // linting purpose
      }
    })
  }));
};

mockPipe();


const mockOCR = (response) => {
  spawn.mockImplementation(() => new Promise((resolve) => {
    resolve({
      stdout: {
        on: async (type, callback) => {
          await callback(response);
        }
      },
      on: (event, callback) => {
        callback();
      }
    });
  }));
};


mockOCR('some test response');
describe('Create passport', () => {
  const user = {
    id: '1000',
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    picture: 'Picture',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  };
  const payload = {
    UserInfo: {
      id: '-MUyHJmKrxA90lPNQ1FOLNm',
      name: 'Samuel Kubai'
    }
  };
  const token = Utils.generateTestToken(payload);
  beforeAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Comment.destroy({ force: true, truncate: { cascade: true } });
    await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.bulkCreate(role);
    await models.User.create(user);
    await models.DocumentTypes.bulkCreate(documentTypes);
  });
  afterAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.DocumentTypes.destroy({ force: true, truncate: { cascade: true } });
  });
  const response = (status, body) => ({
    status,
    body
  });
  it('should return 401 if token is not provided', (done) => {
    const body = {
      success: false,
      error: 'Please provide a token'
    };
    const expectedResponse = response(401, body);
    request(app)
      .post('/api/v1/travelreadiness')
      .send(mockPassport.passportDetail)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });
  it('should add a passport', (done) => {
    request(app)
      .post('/api/v1/travelreadiness')
      .send({ ...mockPassport.passportDetail })
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(201);
        expect(res.body).toMatchObject({});
        done();
      });
  });
  it('should check for empty values', (done) => {
    const expectedResponse = {
      status: 422,
      body: {
        success: false,
        message: 'Validation failed',
        errors: [
          {
            message: 'name is required',
            name: 'passport.name'
          },
          {
            message: 'passport is required',
            name: 'passport.passportNumber'
          },
          {
            message: 'nationality is required',
            name: 'passport.nationality'
          },
          {
            message: 'dateOfBirth is required',
            name: 'passport.dateOfBirth'
          },
          {
            message: 'dateOfIssue is required',
            name: 'passport.dateOfIssue'
          },
          {
            message: 'placeOfIssue is required',
            name: 'passport.placeOfIssue'
          },
          {
            message: 'expiryDate is required',
            name: 'passport.expiryDate'
          },
          {
            message: 'expiry date cannot be before date of issue',
            name: 'passport.expiryDate'
          },
          {
            message: 'cloudinaryUrl is required',
            name: 'passport.cloudinaryUrl'
          }
        ]
      }
    };
    request(app)
      .post('/api/v1/travelreadiness')
      .set('authorization', token)
      .send({ ...mockPassport.emptyPassportDetail })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });
  it('should check for valid cloudinary url', (done) => {
    const body = {
      errors:
        [{ message: 'cloudinaryUrl is not a valid url', name: 'passport.cloudinaryUrl' }],
      message: 'Validation failed',
      success: false
    };
    request(app)
      .post('/api/v1/travelreadiness/')
      .set('authorization', token)
      .send({ ...mockPassport.invalidCloudinaryPassportDetail })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(422);
        expect(res.body).toMatchObject(body);
        done();
      });
  });
  it('should check for invalid passport number', (done) => {
    const body = {
      errors:
        [{ message: 'passport number is not valid', name: 'passport.passportNumber' }],
      message: 'Validation failed',
      success: false
    };
    request(app)
      .post('/api/v1/travelreadiness/')
      .set('authorization', token)
      .send({ ...mockPassport.invalidPassportDetail })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(422);
        expect(res.body).toMatchObject(body);
        done();
      });
  });
  it('should check for invalid dates', (done) => {
    const body = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'The date of birth format you provided is not valid, use: MM/DD/YYYY',
          name: 'passport.dateOfBirth'
        },
        {
          message: 'The date of issue format you provided is not valid, use: MM/DD/YYYY',
          name: 'passport.dateOfIssue'
        },
        {
          message: 'The date of issue format you provided is not valid, use: MM/DD/YYYY',
          name: 'passport.expiryDate'
        }
      ]
    };
    request(app)
      .post('/api/v1/travelreadiness/')
      .set('authorization', token)
      .send({ ...mockPassport.invalidDate })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(422);
        expect(res.body).toMatchObject(body);
        done();
      });
  });
  it('should check if passport is unique', (done) => {
    const body = {
      success: false,
      message: 'validation error',
      errors: [
        {
          message: 'You already have a passport with the same number'
        }
      ]
    };
    const expectedResponse = response(409, body);
    request(app)
      .post('/api/v1/travelreadiness')
      .send({ ...mockPassport.passportDetail })
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });
  describe('scan a passport with python', () => {
    const testOCR = (done, callback) => {
      request(app)
        .post('/api/v1/travelreadiness/documents/scan')
        .send({ ...mockPassport.imageLink })
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .end((err, res) => {
          callback(res.body);
          if (err) return done(err);
          done();
        });
    };
    const passportData = overrides => ({
      mrz_type: 'TD3',
      validScore: 62,
      type: 'P',
      country: 'PRT',
      number: '1700044',
      nationality: 'PRT',
      sex: 'F',
      names: 'INES',
      surname: 'GARCAO DE MAGALHAES',
      personal_number: '99999999',
      check_number: '9',
      check_date_of_birth: '6',
      check_expiration_date: '1',
      check_composite: '0',
      check_personal_number: '8',
      valid_number: false,
      valid_date_of_birth: true,
      valid_expiration_date: true,
      valid_composite: false,
      valid_personal_number: true,
      method: 'rescaled(3)',
      dateOfBirth: '740407',
      expire: '220616',
      ...overrides
    });
    
    beforeAll(() => {
      process.env.OCRSOLUTION = 'python';
    });
    afterEach(() => {
    });
    it('should prompt the user to upload a valid passport image', async (done) => {
      mockOCR('empty');
      testOCR(done, (body) => {
        expect(body.message).toEqual('please upload a valid passport image');
      });
    });
    it('should do an orientation check', async (done) => {
      mockOCR('null');
      testOCR(done, ({ message }) => {
        expect(message)
          .toEqual('Please upload a valid passport image and ensure the image is in landscape');
      });
    });
    it('should check the validity score of the passport', async (done) => {
      mockOCR(JSON.stringify(passportData({ validScore: 20 })));
      testOCR(done, ({ message }) => {
        expect(message).toEqual('Please provide a high resolution Image');
      });
    });
    it('should return the valid passport', async (done) => {
      mockOCR(JSON.stringify(passportData()));
      testOCR(done, ({ passportData: returnedData }) => {
        expect(returnedData).toEqual({
          country: 'Portugal',
          names: 'INES',
          number: '1700044',
          birthDay: '04/07/1974',
          expires: '06/16/2022',
          dateOfIssue: '06/16/2012',
          nationality: 'Portugees',
          validScore: 62,
          sex: 'F',
          surname: 'GARCAO DE MAGALHAES',
          imageLink: '/Users/nesh/Desktop/passport/New-Kenyan-Passport.jpg'
        });
      });
    });
  

    it('should return the valid passport but with countryname not altered', async (done) => {
      mockOCR(JSON.stringify(passportData({ country: 'ISHA' })));
      testOCR(done, ({ passportData: returnedData }) => {
        expect(returnedData).toEqual(
          {
            birthDay: '04/07/1974', country: 'ISHA', dateOfIssue: '06/16/2012', expires: '06/16/2022', imageLink: '/Users/nesh/Desktop/passport/New-Kenyan-Passport.jpg', names: 'INES', nationality: '', number: '1700044', sex: 'F', surname: 'GARCAO DE MAGALHAES', validScore: 62
          }
        );
      });
    });
  });

  describe('scan a passport with  javascript', () => {
    const testOCR = (done, callback) => {
      request(app)
        .post('/api/v1/travelreadiness/documents/scan')
        .send({ ...mockPassport.imageLink })
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .end((err, res) => {
          callback(res.body);
          if (err) return done(err);
          done();
        });
    };
    beforeAll(() => {
      process.env.OCRSOLUTION = 'javascript';
    });

    afterEach(() => {
    });

    it('should return a success image', async (done) => {
      mockOCR(jsData);
      testOCR(done, (body) => {
        expect(body.message).toEqual('Passport succesfully scanned, kindly confirm the details');
      });
    });

    it('should return a success image but with the country name not changed', async (done) => {
      mockOCR(countryPassData);
      testOCR(done, (body) => {
        expect(body.message).toEqual('Passport succesfully scanned, kindly confirm the details');
      });
    });

    it('should do an orientation check', async (done) => {
      mockOCR('null');
      testOCR(done, ({ message }) => {
        expect(message)
          .toEqual('Please upload a valid passport image and ensure the image is in landscape');
      });
    });
    

    it('should return the valid passport', async (done) => {
      mockOCR(jsData);
      testOCR(done, ({ passportData: jsPassportData }) => {
        expect(jsPassportData).toEqual({
          birthDay: 'Invalid date', country: 'Kenya', dateOfIssue: 'Invalid date', expires: 'Invalid date', imageLink: '/Users/nesh/Desktop/passport/New-Kenyan-Passport.jpg', names: '', nationality: 'Kenyan', number: 'AK02704ad', sex: '2', surname: 'GITAUS<MOSES<MUIGAI'
        });
      });
    });
  });
});
