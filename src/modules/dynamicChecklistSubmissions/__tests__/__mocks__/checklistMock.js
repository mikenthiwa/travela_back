
export const scale = {
  id: 'scaleid',
  type: 'scale',
  order: 1,
  prompt: 'Upload a picture',
  response: {
    id: 'option1',
    selectedValue: 0
  },
  behaviour: {},
  configuration: {
    endsAt: 4,
    options: [
      {
        id: 'option1',
        name: '',
        behaviour: {}
      }
    ]
  }
};

export const radio = {
  id: 'radioid',
  type: 'radio',
  order: 1,
  prompt: 'Upload a picture',
  behaviour: {},
  configuration: {
    options: [
      {
        id: 'option1',
        name: 'yes',
        behaviour: {
          type: 'UPLOAD_DOCUMENT',
          payload: 'visa'
        }
      },
      {
        id: 'option2',
        name: 'MAYBE',
        behaviour: {}
      },
    ]
  },
  response: {
    id: 'radioid',
    selectedValue: 'option1',
    behaviour: {
      type: 'UPLOAD_DOCUMENT',
      payload: 'visa',
      document: {},
    }
  }
};

export const checkbox = {
  id: 'checkboxid',
  type: 'checkbox',
  order: 1,
  prompt: 'Upload a picture',
  behaviour: {
    type: 'PREVIEW_DOCUMENT',
    payload: 'www.doc.com',
    document: {},
  },
  
  configuration: {
    options: [
      {
        id: 'option1',
        name: 'yes',
        behaviour: {},
      },
      {
        id: 'option2',
        name: 'MAYBE',
        behaviour: {}
      },
    ]
  },
  response: {
    id: 'checkboxid',
    selectedValue: ['option1'],
    behaviour: {
      type: 'PREVIEW_DOCUMENT',
      payload: 'www.doc.com',
      document: {},
    }
  }
};

export const dropdown = {
  id: 'dropdown',
  type: 'dropdown',
  order: 1,
  prompt: 'Upload a picture',
  behaviour: {},
  configuration: {
    options: [
      {
        id: 'option1',
        name: 'yes',
        behaviour: {
          type: 'SKIP_QUESTION',
          payload: 'visa'
        }
      },
      {
        id: 'option2',
        name: 'MAYBE',
        behaviour: {}
      },
    ]
  },
  response: {
    id: 'dropdown',
    selectedValue: 'option1',
    behaviour: {
      type: 'SKIP_QUESTION',
      payload: 'visa',
      document: {},
    }
  }
};

export const checkbox2 = {
  id: 'checkbox1',
  type: 'checkbox',
  order: 1,
  prompt: 'Upload a picture',
  behaviour: {
    type: 'PREVIEW_DOCUMENT',
    payload: 'www.doc.com',
    document: {},
  },
  
  configuration: {
    options: [
      {
        id: 'option1',
        name: 'yes',
        behaviour: {},
      },
      {
        id: 'option2',
        name: 'MAYBE',
        behaviour: {}
      },
    ]
  },
  response: {
    id: 'checkbox1',
    selectedValue: ['option1'],
    behaviour: {
      type: 'PREVIEW_DOCUMENT',
      payload: 'www.doc.com',
      document: {},
    }
  }
};

export const checkbox3 = {
  id: 'checkbox3',
  type: 'checkbox',
  order: 1,
  prompt: 'Upload a picture',

  behaviour: {
    type: 'NOTIFY_EMAIL',
    payload: {
      recipient: 'kk@kk.kk',
      payload: 'what happens when you cannot demo on time? <email>'
    },
  },
  
  configuration: {
    options: [
      {
        id: 'option1',
        name: 'yes',
        behaviour: {},
      },
      {
        id: 'option2',
        name: 'MAYBE',
        behaviour: {}
      },
    ]
  },
  response: {
    id: 'checkbox3',
    selectedValue: ['option1'],
    behaviour: {
      type: 'NOTIFY_EMAIL',
      payload: {
        recipient: 'example@some.com',
        template: 'what happens when you cannot demo on time? <email> <name> <location>'
      },
    }
  }
};

export const trip = {
  id: '2pRJdQUEJu',
  bedId: null,
  origin: 'Kampala, Uganda',
  request: {
    tripType: 'oneWay'
  },
  createdAt: '2019-08-17T21:00:05.610Z',
  deletedAt: null,
  requestId: 'hZjKdAVKr',
  updatedAt: '2019-08-17T21:00:05.610Z',
  returnDate: null,
  checkInDate: null,
  checkStatus: 'Not Checked In',
  destination: 'Lagos, Nigeria',
  checkOutDate: null,
  departureDate: '2019-08-31',
  flightDetails: {
    ticket: 'https://res.cloudinary.com/authors-haven/image/upload/v1566298523/bzpe951qf0kxri2ehyzd.png',
    airline: 'K-AIRLINES',
    arrivalTime: '2019-08-31T00:00:00.000Z',
    flightNumber: '12345',
    departureTime: '2019-08-31'
  },
  travelReasons: 2,
  lastNotifyDate: null,
  travelCompletion: 'false',
  accommodationType: 'Not Required',
  notificationCount: 0,
  otherTravelReasons: null
};

export const invalidRadio = {
  id: 'radioid',
  type: 'radio',
  order: 1,
  prompt: 'Upload a picture',
  behaviour: {},
  configuration: {
    options: [
      {
        id: 'option1',
        name: 'yes',
        behaviour: {
          type: 'UPLOAD_DOCUMENT',
          payload: 'visa'
        }
      },
      {
        id: 'option2',
        name: 'MAYBE',
        behaviour: {}
      },
    ]
  },
  response: {
    id: 'radioid',
    selectedValue: '',
    behaviour: {}
  }
};

export const returnTrip = {
  id: 'trip2',
  bedId: null,
  origin: 'Kampala, Uganda',
  request: {
    tripType: 'return'
  },
  createdAt: '2019-08-17T21:00:05.610Z',
  deletedAt: null,
  requestId: 'hZjKdAVKr',
  updatedAt: '2019-08-17T21:00:05.610Z',
  returnDate: '2019-09-09',
  checkInDate: null,
  checkStatus: 'Not Checked In',
  destination: 'Lagos, Nigeria',
  checkOutDate: null,
  departureDate: '2019-08-31',
  flightDetails: {
    ticket: 'https://res.cloudinary.com/authors-haven/image/upload/v1566298523/bzpe951qf0kxri2ehyzd.png',
    airline: 'K-AIRLINES',
    arrivalTime: '2019-08-31T00:00:00.000Z',
    flightNumber: '12345',
    departureTime: '2019-08-31'
  },
  travelReasons: 2,
  lastNotifyDate: null,
  travelCompletion: 'false',
  accommodationType: 'Not Required',
  notificationCount: 0,
  otherTravelReasons: null
};

export const invalidTrip = {
  id: 'trip2',
  bedId: null,
  origin: 'Kampala, Uganda',
  request: {
    tripType: 'return'
  },
  createdAt: '2019-08-17T21:00:05.610Z',
  deletedAt: null,
  requestId: 'hZjKdAVKr',
  updatedAt: '2019-08-17T21:00:05.610Z',
  returnDate: '2019-09-09',
  checkInDate: null,
  checkStatus: 'Not Checked In',
  destination: 'Lagos, Nigeria',
  checkOutDate: null,
  departureDate: '2019-08-31',
  flightDetails: {
    ticket: 'https://res.cloudinary.com/authors-haven/image/upload/v1566298523/bzpe951qf0kxri2ehyzd.png',
    airline: 'K-AIRLINES',
    arrivalTime: '2019-08-31T00:00:00.000Z',
    flightNumber: '12345',
    departureTime: '2019-08-31'
  },
  travelReasons: 2,
  lastNotifyDate: null,
  travelCompletion: 'false',
  accommodationType: 'Not Required',
  notificationCount: 0,
  otherTravelReasons: null
};
