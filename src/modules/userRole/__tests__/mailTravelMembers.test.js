import debug from 'debug';
import MailTravelMembers from '../MailTravelMembers';
import NotificationEngine from '../../notifications/NotificationEngine';
import models from '../../../database/models';
import { role as roles } from './mocks/mockData';
import TravelChecklistController from '../../travelChecklist/TravelChecklistController';
import env from '../../../config/environment';


// we need three users: requester, origin travel team member and destination travel team member
// we need 1 request going from the origin to the destination, we will simulate 100% completion by
// mocking the TravelChecklistController's checkListPercentageNumber method

const mockAndelaOrigin = {
  id: 1234,
  location: 'National City, Wakanda',
};

const mockAndelaDestination = {
  id: 4321,
  location: 'Central City, Wakanda',
};

const requester = {
  fullName: 'Dave Mathews',
  passportName: 'Dave Mathews Njeru',
  department: 'Talent & Development',
  occupation: 'Software developer',
  email: 'this.requester@gmail.com',
  userId: 'q-wKFo34sP',
  picture: 'profile.png',
  location: 'National City, Wakanda',
  manager: 'Samuel Kubai',
  gender: 'Male',
  roleId: 401938,
  id: 1,
};

const originTTM = {
  fullName: 'Origin TTM',
  passportName: 'Origin Travel Team Member',
  department: 'Guest Relations & Travel',
  occupation: 'Travel Team Member',
  email: 'origin.TTM@gmail.com',
  userId: 'q-wKFo34sOTTM',
  picture: 'profile.png',
  location: 'Central City, Wakanda',
  manager: 'Samuel Kubai',
  gender: 'Male',
  roleId: 339458,
  id: 2,
};

const destinationTTM = {
  fullName: 'Destination TTM',
  passportName: 'Destination Travel Team Member',
  department: 'Guest Relations & Travel',
  occupation: 'Travel Team Member',
  email: 'destination.TTM@gmail.com',
  userId: 'q-wKFo34sDTTM',
  picture: 'profile.png',
  location: 'National City, Wakanda',
  manager: 'Samuel Kubai',
  gender: 'Male',
  roleId: 339458,
  id: 3,
};

const mockRequest = {
  request: {
    id: 'vB0NNHWFf',
    name: requester.passportName,
    manager: requester.manager,
    gender: requester.gender,
    department: requester.department,
    role: requester.occupation,
    status: 'Approved',
    userId: requester.userId,
    tripType: 'return',
    picture: requester.picture,
  },

  trip: {
    id: 'OwdBcOW4ys',
    requestId: 'vB0NNHWFf',
    origin: originTTM.location,
    destination: destinationTTM.location,
    departureDate: '2018-11-24',
    returnDate: '2018-11-30',
    bedId: null,
    travelCompletion: 'false',
  }

};


describe('Mail Travel Members', () => {
  const cleanDBForUse = async () => {
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
  };

  beforeAll(async (done) => {
    jest.spyOn(debug, 'log');
    NotificationEngine.sendMail = jest.fn(() => 0);
    TravelChecklistController.checkListPercentageNumber = jest.fn();

    await cleanDBForUse();

    await models.Role.bulkCreate(roles);
    await models.Center.bulkCreate([mockAndelaOrigin, mockAndelaDestination]);
    await models.User.bulkCreate([requester, originTTM, destinationTTM]);
    await models.UserRole.create({
      userId: requester.id,
      roleId: requester.roleId,
    });
    await models.UserRole.create({
      userId: originTTM.id,
      roleId: originTTM.roleId,
    });
    await models.UserRole.create({
      userId: destinationTTM.id,
      roleId: destinationTTM.roleId,
    });
    await models.Request.create(mockRequest.request);
    await models.Trip.create(mockRequest.trip);

    done();
  });

  afterAll(async () => {
    await cleanDBForUse();
  });

  it('should check for readiness percentage number', async (done) => {
    await MailTravelMembers.executeMailSend({}, {});
    expect(TravelChecklistController.checkListPercentageNumber)
      .toHaveBeenCalledWith({ query: {} }, {}, mockRequest.request.id);
    done();
  });

  it('should not send an email if the travel readiness is less than 100', async (done) => {
    await MailTravelMembers.executeMailSend({}, {});
    expect(NotificationEngine.sendMail).not.toHaveBeenCalled();
    done();
  });

  it('should not crash when centers are not found for travel team members', async (done) => {
    TravelChecklistController
      .checkListPercentageNumber = jest.fn().mockImplementationOnce(() => 100);
    await MailTravelMembers.executeMailSend({}, {});
    expect(debug.log).toHaveBeenCalledTimes(2);
    const [[arg1], [arg2]] = debug.log.mock.calls;
    const message = 'has no set centers. This needs to be corrected!';
    expect(arg1).toEqual(`${destinationTTM.fullName} ${message}`);
    expect(arg2).toEqual(`${originTTM.fullName} ${message}`);
    done();
  });

  describe('When readiness percentage is 100', () => {
    const { REDIRECT_URL } = env;

    beforeAll(async (done) => {
      await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
      await models.UserRole.create({
        userId: originTTM.id,
        roleId: originTTM.roleId,
        centerId: mockAndelaOrigin.id,
      });
      await models.UserRole.create({
        userId: destinationTTM.id,
        roleId: destinationTTM.roleId,
        centerId: mockAndelaDestination.id,
      });
      TravelChecklistController
        .checkListPercentageNumber = jest.fn().mockImplementationOnce(() => 100);
      await MailTravelMembers.executeMailSend({}, {});
      done();
    });

    it('should have sent 2 emails', () => {
      expect(NotificationEngine.sendMail).toHaveBeenCalledTimes(2);
    });

    it('should send email to destination travel team members ', () => {
      const expectedArgs = {
        recipient: {
          email: destinationTTM.email,
          name: destinationTTM.fullName,
        },
        redirectLink: `${REDIRECT_URL}/redirect/dashboard#travel-readiness`,
        sender: ['Travela', requester.passportName, mockRequest.trip.destination],
        topic: 'Travel readiness completion',
        type: 'Travel Readiness',
      };
      const [foundArgs] = NotificationEngine.sendMail.mock.calls[0];
      expect(foundArgs)
        .toEqual(expectedArgs);
    });

    it('should send email to origin travel team members', () => {
      const expectedArgs = {
        recipient: {
          email: originTTM.email,
          name: originTTM.fullName,
        },
        redirectLink: `${REDIRECT_URL}/redirect/dashboard#travel-readiness`,
        sender: ['Travela', requester.passportName, mockRequest.trip.destination],
        topic: 'Travel readiness completion',
        type: 'Travel Readiness',
      };

      const [foundArgs] = NotificationEngine.sendMail.mock.calls[1];
      expect(foundArgs).toEqual(expectedArgs);
    });

    it('should update the trips travelCompletion to "true" to avoid sending multiple emails',
      async (done) => {
        await setTimeout(
          async () => {
            const updatedTrip = await models.Trip.findById(mockRequest.trip.id);
            expect(updatedTrip.travelCompletion).toEqual('true');
            done();
          }, 200
        );
      });

    it('should not send any email if travelCompletion is "true', async (done) => {
      await NotificationEngine.sendMail.mockReset();
      TravelChecklistController
        .checkListPercentageNumber = jest.fn().mockImplementationOnce(() => 100);
      await MailTravelMembers.executeMailSend({}, {});
      expect(NotificationEngine.sendMail).not.toHaveBeenCalled();
      done();
    });
  });
});
