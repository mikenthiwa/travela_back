import joi from '@hapi/joi';

const tripValidator = (trip) => {
  let schema = {
    departureTime: joi.date().min(new Date(trip.departureDate).getUTCDate()).required(),
    arrivalTime: joi.date().min(new Date(trip.departureDate).getUTCDate()).when('departureTime', {
      is: joi.date().required(),
      then: joi.date().min(joi.ref('departureTime'))
    }).required(),
    flightNumber: joi.string().required(),
    airline: joi.string().required(),
    ticket: joi.string().uri().required()
  };

  if (trip.request.tripType === 'return') {
    schema = {
      ...schema,
      returnDepartureTime: joi.date().min(new Date(trip.returnDate).getUTCDate()).required(),
      returnArrivalTime: joi.date().min(new Date(trip.returnDate).getUTCDate()).when('returnDepartureTime', {
        is: joi.date().required(),
        then: joi.date().min(joi.ref('returnDepartureTime'))
      }).required(),
      returnFlightNumber: joi.string().required(),
      returnAirline: joi.string().required(),
    };
  }

  const value = joi.object(schema).validate(trip.flightDetails);

  return !value.error;
};

export default tripValidator;
