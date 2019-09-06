import RequestUtils from '../../../modules/requests/RequestUtils';
import TravelCostsController from '../../../modules/travelCosts/TravelCostsController';

export const mockRequestData = {
  id: 'j4Ijj7dpr',
  name: 'Moses Gitau',
  tripType: 'multi',
  manager: 627,
  gender: 'Male',
  department: 'Engineering-Fellowship',
  role: 'Software Developer',
  status: 'Open',
  userId: '1609',
  picture: 'https://lh3.googleusercontent.com/a-/AAuE7mC32VGAsj8Zzreh7If69tb2Qm6FnOQ1zYGegL5G=s96-c',
  stipend: 0,
  budgetStatus: 'Open',
  createdAt: '2019-09-06T05:42:12.906Z',
  updatedAt: '2019-09-06T05:42:12.906Z',
  deletedAt: null,
  tripModificationId: null,
  modifications: [],
  currentModification: null,
  comments: [],
  trips: [{
    id: 'wEZz2J1j0G',
    origin: 'Nairobi, Kenya',
    destination: 'Kampala, Uganda',
    departureDate: '2019-10-28',
    returnDate: '2019-10-31',
    checkStatus: 'Not Checked In',
    checkInDate: null,
    checkOutDate: null,
    accommodationType: 'Not Required',
    lastNotifyDate: null,
    notificationCount: 0,
    travelCompletion: 'false',
    otherTravelReasons: 'asdfsadfasdf',
    createdAt: '2019-09-06T05:42:12.913Z',
    updatedAt: '2019-09-06T05:42:12.913Z',
    deletedAt: null,
    travelReasons: null,
    bedId: null,
    requestId: 'j4Ijj7dpr',
    reasons: null,
    beds: null
  }, {
    id: 'opVRzxfrSB',
    origin: 'Kampala, Uganda',
    destination: 'Lagos, Nigeria',
    departureDate: '2019-10-31',
    returnDate: '2019-11-03',
    checkStatus: 'Not Checked In',
    checkInDate: null,
    checkOutDate: null,
    accommodationType: 'Residence',
    lastNotifyDate: null,
    notificationCount: 0,
    travelCompletion: 'false',
    otherTravelReasons: 'asdfasdfsdfa',
    createdAt: '2019-09-06T05:42:12.913Z',
    updatedAt: '2019-09-06T05:42:12.913Z',
    deletedAt: null,
    travelReasons: null,
    bedId: 1,
    requestId: 'j4Ijj7dpr',
    reasons: null,
    beds: {
      id: 1,
      bedName: 'bed 1',
      booked: false,
      createdAt: '2019-09-05T21:27:56.589Z',
      updatedAt: '2019-09-05T21:27:56.589Z',
      roomId: 'zp1Ss5s7EF',
      rooms: {
        id: 'zp1Ss5s7EF',
        roomName: 'Travela',
        roomType: 'Non-Ensuite',
        bedCount: 1,
        isDeleted: false,
        faulty: false,
        createdAt: '2019-09-05T21:27:56.583Z',
        updatedAt: '2019-09-05T21:27:56.583Z',
        guestHouseId: 'odFwnVxAa',
        guestHouses: {
          id: 'odFwnVxAa',
          houseName: 'c/o Timothy Kambuni, 2502',
          location: 'Lagos, Nigeria',
          bathRooms: 1,
          imageUrl: 'https://res.cloudinary.com/travela-andela/image/upload/v1567718875/staging/ko72nxofmtvvgomsimdg.png',
          genderPolicy: 'Unisex',
          disabled: false,
          createdAt: '2019-09-05T21:27:56.576Z',
          updatedAt: '2019-09-05T21:27:56.576Z',
          userId: '1609'
        }
      }
    }
  }, {
    id: 'Faypl6jHJg',
    origin: 'Lagos, Nigeria',
    destination:
        'Nairobi, Kenya',
    departureDate: '2019-11-03',
    returnDate: null,
    checkStatus: 'Not Checked In',
    checkInDate: null,
    checkOutDate: null,
    accommodationType: 'Not Required',
    lastNotifyDate: null,
    notificationCount: 0,
    travelCompletion: 'false',
    otherTravelReasons: 'adsfasdfsadf',
    createdAt: '2019-09-06T05:42:12.913Z',
    updatedAt: '2019-09-06T05:42:12.913Z',
    deletedAt: null,
    travelReasons: null,
    bedId: null,
    requestId: 'j4Ijj7dpr',
    reasons: null,
    beds: null
  }],
  dynamicChecklistSubmission: null
};

export const mockTravelCosts = {
  hotelEstimates: [{
    id: 2, amount: 500, countryId: 9, country: { country: 'Kenya' }
  }],
  travelStipends: [{ id: 20, amount: 200, country: 'Kenya' }],
  flightCosts: [{ origin: 'Nigeria', destination: 'Kenya', cost: 500 }]
};


export default (requestData = mockRequestData, travelCosts = mockTravelCosts) => {
  RequestUtils.getRequestData = jest.fn();
  RequestUtils.getRequestData.mockImplementation(() => ({ requestData }));
  TravelCostsController.getTravelStipends = jest.fn();
  TravelCostsController.getHotelEstimates = jest.fn();
  TravelCostsController.getFlightCosts = jest.fn();

  TravelCostsController.getTravelStipends.mockImplementation(() => travelCosts.travelStipends);
  TravelCostsController.getHotelEstimates.mockImplementation(() => travelCosts.hotelEstimates);
  TravelCostsController.getFlightCosts.mockImplementation(() => travelCosts.flightCosts);
};
