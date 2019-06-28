const passportDetail = {
  passport: {
    name: 'Michael Nthiwa',
    passportNumber: 'ABC123abc',
    nationality: 'kenyan',
    dateOfBirth: '11/06/1970',
    dateOfIssue: '11/06/1979',
    placeOfIssue: 'Kenya',
    expiryDate: '06/22/2018',
    cloudinaryUrl: 'https://res.cloudinary.com/skybound/image/upload/s--JluVPO5v--/v1558937822/frontend_upload/Kena_b5vuba.jpg'
  }
};
const invalidPassportDetail = {
  passport: {
    name: 'Michael',
    passportNumber: 'A',
    nationality: 'kenyan',
    dateOfBirth: '11/06/1970',
    dateOfIssue: '11/06/1979',
    placeOfIssue: 'Kenya',
    expiryDate: '06/22/2018',
    cloudinaryUrl: 'https://res.cloudinary.com/dbk8ky24f/image/upload/v1543520867/oga7x8ewofyyirrlk9hv.jpg'
  }
};

const emptyPassportDetail = {
  passport: {
    name: '',
    nationality: '',
    dateOfBirth: '',
    dateOfIssue: '',
    placeOfIssue: '',
    expiryDate: '',
    cloudinaryUrl: ''
  }
};

const invalidCloudinaryPassportDetail = {
  passport: {
    name: 'Michael',
    passportNumber: 'ABC123abc',
    nationality: 'kenyan',
    dateOfBirth: '11/06/1970',
    dateOfIssue: '11/06/1979',
    placeOfIssue: 'Kenya',
    expiryDate: '06/22/2018',
    cloudinaryUrl: 'https://farm4.staticflickr.com/3894/15008518202_c265dfa55f_h'
  }
};

const invalidDate = {
  passport: {
    name: 'Mike',
    passportNumber: 'ABC123abczyej3',
    nationality: 'Kenyan ',
    dateOfBirth: '2018',
    dateOfIssue: '2015',
    placeOfIssue: 'Kenya',
    expiryDate: '2018',
    cloudinaryUrl: 'https://res.cloudinary.com/dbk8ky24f/image/upload/v1543520867/oga8ewofyyirrlk9hv.jpg'
  }
};

const imageLink = {
  imageLink: '/Users/nesh/Desktop/passport/New-Kenyan-Passport.jpg'
};

const passportData = {
  success: true,
  message: 'passport succesfully scanned kindly confirm the details',
  passportData: {
    country: 'Portugal',
    names: 'INES',
    number: '1700044',
    birthDay: '04/07/1974',
    expirationDate: '06/16/2022',
    dateOfIssue: '06/16/2012',
    nationality: 'Portugees',
    validScore: 62,
    sex: 'F',
    surname: 'GARCAO DE MAGALHAES',
    imageLink: 'https://res.cloudinary.com/skybound/image/upload/s--lgB7GcUj--/v1560983033/frontend_upload/passport_quqhg1.jpg'
  }
};


export default {
  passportDetail,
  invalidPassportDetail,
  emptyPassportDetail,
  invalidCloudinaryPassportDetail,
  invalidDate,
  imageLink,
  passportData
};
