export const payload = {
  UserInfo: {
    id: 2167,
    fullName: 'Oluebube Egbuna',
    name: 'Oluebube Egbuna',
    email: 'oluebube.egbuna@andela.com',
    picture: 'fake.png'
  },
};

export const user = {
  id: 2167,
  fullName: 'Oluebube Egbuna',
  name: 'Oluebube Egbuna',
  email: 'oluebube.egbuna@andela.com',
  picture: 'fake.png',
  userId: 2167,
  location: 'Lagos, Nigeria'
};
  
export const userRole = [
  {
    id: 1,
    userId: 2167,
    roleId: 10948,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
  {
    id: 2,
    userId: 2167,
    roleId: 29187,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
  {
    id: 3,
    userId: 2167,
    roleId: 339458,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  }
];

export const checklistData = {
  origin: { region: 'West Africa' },
  destinations: { regions: ['North Africa'] },
  config: [
    {
      order: 1,
      prompt: 'Do you have a passport',
      type: 'image',
      url: '',
      configuration: {
        options: [],
        url: '',
        behaviour: {
          name: 'preview image',
          action: {
            type: 'PREVIEW_IMAGE',
            payload: 'http://url'
          }
        }
      }
    }
  ]
};

export const checklistData2 = {
  origin: { country: 'Nigeria' },
  destinations: { countries: ['Kenya', 'Uganda', 'USA'] },
  config: [
    {
      order: 1,
      prompt: 'Do you have a passport',
      type: 'image',
      url: '',
      configuration: {
        options: [],
        url: '',
        behaviour: {
          name: 'preview image',
          action: {
            type: 'PREVIEW_IMAGE',
            payload: 'http://url'
          }
        }
      }
    }
  ]
};

export const checklistDataInvalidKeys = {
  originsss: { region: 'West Africa' },
  destinations: { regions: ['North Africa'] },
  config: [
    {
      order: 1,
      prompt: 'Do you have a passport',
      type: 'image',
      url: '',
      configuration: {
        options: [],
        url: '',
        behaviour: {
          name: 'preview image',
          action: {
            type: 'PREVIEW_IMAGE',
            payload: 'http://url'
          }
        }
      }
    }
  ]
};

export const checklistDataInvalidOrigin = {
  origin: { region: 'West Africa' },
  destinations: { regions: ['North Africa', 'West Africa'] },
  config: [
    {
      order: 1,
      prompt: 'Do you have a passport',
      type: 'image',
      url: '',
      configuration: {
        options: [],
        url: '',
        behaviour: {
          name: 'preview image',
          action: {
            type: 'PREVIEW_IMAGE',
            payload: 'http://url'
          }
        }
      }
    }
  ]
};

export const checklistDataInvalidDestinationKey = {
  origin: { region: 'West Africa' },
  destinations: { regionsss: ['North Africa', 'West Africa'] },
  config: [
    {
      order: 1,
      prompt: 'Do you have a passport',
      type: 'image',
      url: '',
      configuration: {
        options: [],
        url: '',
        behaviour: {
          name: 'preview image',
          action: {
            type: 'PREVIEW_IMAGE',
            payload: 'http://url'
          }
        }
      }
    }
  ]
};

export const travelRegion = { id: 9999, region: 'Default', description: 'defailt countries' };

const date = new Date();
const dateToday = new Date(date.setDate(date.getDate()))
  .toISOString().split('T')[0];
const dateDeparture = new Date(date.setDate(date.getDate() + 1))
  .toISOString().split('T')[0];
const dateReturn = new Date(date.setDate(date.getDate() + 3))
  .toISOString().split('T')[0];

export const dates = {
  departureDate: dateDeparture,
  returnDate: dateReturn,
  dateToday
};

export const tripsData = [
  {
    id: 1,
    requestId: 'request-id-6',
    origin: 'Lagos, Nigeria',
    destination: 'Kampala, Uganda',
    departureDate: dates.departureDate,
    returnDate: dates.returnDate,
  },
  {
    id: 2,
    requestId: 'request-id-7',
    origin: 'New York, United States of America',
    destination: 'Nairobi, Kenya',
    departureDate: dates.dateToday,
    returnDate: dates.returnDate,
  },
  {
    id: 3,
    requestId: 'request-id-8',
    origin: 'New York, United States of America',
    destination: 'Nairobi, Kenya',
    departureDate: '2018-09-27',
    returnDate: dates.returnDate,
  },
];

export const requests = [
  {
    id: 'request-id-6',
    name: 'Samuel Kubai',
    status: 'Open',
    gender: 'Male',
    department: 'TDD',
    manager: 'David ssali',
    role: 'Senior Consultant',
    tripType: 'multi',
    picture: 'test.photo.test',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm'
  },
  {
    id: 'request-id-7',
    name: 'Samuel Kubai',
    status: 'Open',
    gender: 'Male',
    department: 'TDD',
    manager: 'David ssali',
    role: 'Senior Consultant',
    tripType: 'return',
    picture: 'test.photo.test',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm'
  },
  {
    id: 'request-id-8',
    name: 'Samuel Kubai',
    status: 'Verified',
    gender: 'Male',
    department: 'TDD',
    manager: 'David ssali',
    role: 'Senior Consultant',
    tripType: 'return',
    picture: 'test.photo.test',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm'
  },
  {
    id: 'request-id-9',
    name: 'Samuel Kubai',
    status: 'Verified',
    gender: 'Male',
    department: 'TDD',
    manager: 'David ssali',
    role: 'Senior Consultant',
    tripType: 'return',
    picture: 'test.photo.test',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm'
  }
];
