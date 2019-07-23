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

export const travelRegion = { id: 9999, region: 'Default', description: 'defailt countries' };
