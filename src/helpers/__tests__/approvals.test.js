import models from '../../database/models';
import UserRoleController from '../../modules/userRole/UserRoleController';
import TravelReadinessUtils from '../../modules/travelReadinessDocuments/TravelReadinessUtils';
import { getTravelTeamEmailData, updateStatus, emailTopic } from '../approvals';
import UserHelper from '../user';
import { srcRequestWhereClause } from '../requests';

const users = [
  {
    id: 1,
    location: 'Nairobi, Kenya'
  },
  {
    id: 2,
    location: 'Kampala, Uganda'
  }
];

const requests = [
  {
    id: 20,
    trips: [
      {
        origin: 'Nairobi, Kenya',
        destination: 'Lagos, Nigeria'
      },
    ]
  },
  {
    id: 21,
    trips: [
      {
        origin: 'Kigali, Rwanda',
        destination: 'Kampala, Uganda'
      }
    ]
  },
  {
    id: 22,
    trips: [
      {
        origin: 'San Fransisco, USA',
        destination: 'Cairo, Egypt'
      }
    ]
  }
];
models.Trip.findAll = jest.fn(({ where: { requestId } }) => Promise.resolve(
  requests.find(request => request.id === requestId).trips
));

UserRoleController.calculateUserRole = jest.fn(() => Promise.resolve({
  users
}));

TravelReadinessUtils.getRoleMembers = jest.fn(
  (roleMembers, locations) => Promise.resolve(
    roleMembers.filter(user => locations.find(location => location === user.location.split(',')[0]))
  )
);

describe('Travel Team Email', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('Should return the mail data with travel team members for the trips location', async () => {
    const data = await getTravelTeamEmailData(requests[0], 'Moses Gitau');

    expect(data).toEqual(
      {
        data: {
          details: { requestId: 20 },
          redirectLink: `${process.env.REDIRECT_URL}/requests/my-verifications/20`,
          sender: 'Moses Gitau',
          topic: 'Manager Approval',
          type: 'Notify Travel Admins of Manager Approval'
        },
        travelAdmins: [{ id: 1, location: 'Nairobi, Kenya' }]
      }
    );
  });

  it('Should return null if no travel admins exist for that location', async () => {
    const data = await getTravelTeamEmailData(requests[2], 'Moses Gitau');

    expect(data).toBe(null);
  });
});

describe('User country Test', () => {
  it('Should return user country when city is passed', async () => {
    const data = await UserHelper.getUserCountry('Lagos');
    expect(data).toEqual('Nigeria');
  });

  it('Should return user country when country is passed', async () => {
    const data = await UserHelper.getUserCountry('Nigeria');
    expect(data).toEqual('Nigeria');
  });
});

describe('Update Status Test', () => {
  it('Should return new status given the initial state', async () => {
    const data = await updateStatus('rejected');
    expect(data).toEqual('Rejected');
  });

  it('Should return Open state when match not found', async () => {
    const data = await updateStatus('Approved');
    expect(data).toEqual('Open');
  });
});


describe('Email Topic Test', () => {
  const rejectRequest = {
    id: 1,
    status: 'Approved',
    budgetStatus: 'Rejected'
  };
  const openRequest = {
    id: 2,
    status: 'Approved',
    budgetStatus: 'Open'
  };

  it('Should rejected email topic', async () => {
    const mailTopic = await emailTopic(rejectRequest);
    expect(mailTopic).toEqual('Travela Budget Rejected Request');
  });

  it('Should open email topic', async () => {
    const mailTopic = await emailTopic(openRequest);
    expect(mailTopic).toEqual(`Travela ${openRequest.status} Request`);
  });
});


describe('Request Where Clause Test', () => {
  it('Should return where clause status', async () => {
    const expected = { status: ['Approved', 'Verified'] };
    const received = await srcRequestWhereClause();
    expect(received).toEqual(expected);
  });
});
