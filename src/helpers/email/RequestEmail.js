import moment from 'moment';
import RequestUtils from '../../modules/requests/RequestUtils';
import TravelCostsController from '../../modules/travelCosts/TravelCostsController';
import NotificationEngine from '../../modules/notifications/NotificationEngine';

class RequestEmail {
  constructor(requestId) {
    this.requestId = requestId;
    this.generateTripType = () => {
      if (/multi/i.test(this.request.tripType)) {
        return 'Multi City';
      }
      return this.request.tripType;
    };
  }

  static async calculateCosts({
    trip, flightEstimates, hotelEstimates, travelStipends
  }) {
    const days = moment(trip.returnDate).diff(moment(trip.departureDate), 'days') || 0;
    return {
      flightEstimates: flightEstimates.length ? flightEstimates[0].cost : 0,
      hotelEstimates: hotelEstimates.length ? hotelEstimates[0].amount * days : 0,
      travelStipends: travelStipends.length ? travelStipends[0].amount * days : 0
    };
  }

  async generateData() {
    const { requestData } = await RequestUtils.getRequestData(null, this.requestId);
    this.request = requestData;
    this.costs = await Promise.all(this.request.trips.map(async (trip) => {
      const locations = [JSON.stringify({ origin: trip.origin, destination: trip.destination })];
      const flightEstimates = await TravelCostsController.getFlightCosts(locations) || [];
      const hotelEstimates = await TravelCostsController.getHotelEstimates(locations) || [];
      const travelStipends = await TravelCostsController.getTravelStipends(locations) || [];
      return RequestEmail.calculateCosts({
        trip, flightEstimates, hotelEstimates, travelStipends
      });
    }));
  }

  getHeader() {
    // eslint-disable-next-line max-len
    return `Your direct report 
            <b style='text-transform: capitalize'> ${this.request.name} </b> 
              has just submitted a
            <b style="text-transform: uppercase">${this.generateTripType()}</b>
              trip on Travela. `;
  }

  generateTrips() {
    const generateAccommodation = ({ accommodationType, beds }) => {
      if (accommodationType === 'Residence') {
        return `${beds.bedName}, ${beds.rooms.roomName}, ${beds.rooms.guestHouses.houseName}`;
      }
      return accommodationType;
    };
    return this.request.trips.map((trip, index) => {
      const departureDate = moment(trip.departureDate).format('MMM DD');
      const returnDate = trip.returnDate ? moment(trip.returnDate).format('MMM DD') : null;

      const dates = `${departureDate}${returnDate ? `- ${returnDate}` : ''}`;

      return `
            <tr>
              <td style="white-space: nowrap"><b>Trip ${index + 1}</b></td>
              <td>${trip.origin.split(',')[0]} - ${trip.destination.split(',')[0]}</td>
              <td>${dates}</td>
              <td>${generateAccommodation(trip)}</td>
            </tr>
      `;
    }).join('');
  }

  generateTravelCosts() {
    return this.costs.map(({ flightEstimates, hotelEstimates, travelStipends }, index) => {
      const grandTotal = [flightEstimates, hotelEstimates, travelStipends].reduce(
        (acc, current) => acc + current, 0
      );
      return `
            <tr>
              <td><b>Trip ${index + 1}</b></td>
              <td>${travelStipends}$</td>
              <td>${hotelEstimates}$</td>
              <td>${flightEstimates}$</td>
              <td>${grandTotal}$</td>
            </tr>
      `;
    }).join('');
  }

  renderRequestInfo() {
    return `
      <h3 style="color: #333E44">Request Information</h3>
        <table style=" text-align: left; margin: 10px auto 30px auto; border-collapse: separate; border: 1px solid #ddd; border-spacing: 1em">
          <thead>
            <tr>
              <th></th>
              <th>Flight</th>
              <th>Dates</th>
              <th>Accommodation</th>
            </tr>
          </thead>
          <tbody>
          ${this.generateTrips()}
          </tbody>
        </table>
        <h3 style="color: #333E44">Travel Cost</h3>
        <table style=" text-align: left; margin: 10px auto 30px auto; border-collapse: separate; border: 1px solid #ddd; border-spacing: 1em">
          <thead>
            <tr>
              <th></th>
              <th>Travel Stipend</th>
              <th>Hotel Cost</th>
              <th>Flight Cost</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.generateTravelCosts()}
          </tbody>
        </table>
    `;
  }

  static renderButtonsMessage() {
    return 'To make an approval decision, either use the buttons below or Login to Travela';
  }

  static renderFooter({ approvalLink, redirectLink, rejectLink }) {
    NotificationEngine.verifyRedirectLink(redirectLink);
    return `
      <div>
        <p style="text-align: center"> 
        ${RequestEmail.renderButtonsMessage()}
        </p>
        <table style=" margin: auto; text-align: center; border-spacing: 1em">
          <tr>
            <td>
              <a href="${approvalLink}" class="button"
                style=" width:100px; border-radius: 4px; border: 1px solid green; text-decoration: none; color: black; font-size: 0.8em; text-align: center; display: block; padding: 10px 10px; ">
                Approve
              </a>
            </td>
            <td>
              <a href="${rejectLink}" class="button"
                style=" width:100px; border-radius: 4px; border: 1px solid green; text-decoration: none; color: black; font-size: 0.8em; text-align: center; display: block; padding: 10px 10px; ">
                Reject
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <a href="${redirectLink}" class="button"
                style=" width:100px; border-radius: 4px; background: #3359DB; text-decoration: none; color: white; font-size: 0.8em; text-align: center; display: block; padding: 10px 10px; margin: 30px auto">
                Login to Travela
              </a>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  generateHTML() {
    return `
    <div style=" background-color: #ececec; display: grid; grid-template-columns: 1fr; grid-gap: 1px; margin: 0; padding-top: 80px; font-weight: 100; text-align: center;">
      <div style=" height: max-content; background-color: #FFFFFF; width: 610px; border: 1px solid #F5F5F5; margin: 0 auto;">
        <style>
          @font-face { font-family: DINPro; src: url(https://res.cloudinary.com/travela-andela/raw/upload/v1545298182/staging/FontFont_-_DINPro.otf); }
          * { font-family: DINPro; }
        </style>
        <div style=" color: green; font-size: 27px; font-weight: bold; margin-top: 91.15px; display: flex; justify-content: center;">
          <img alt="logo" src="https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png" style=" display: block; width: 140px; margin: 0 auto; height: 40px;"/>
        </div>
        <h2 style="font-weight: 500; margin-top: 40px; margin-bottom: 30px; color: #333E44;">
          <b>Hi ${this.recipient.fullName}</b>
        </h2>
        <p style=" width: 406px; display: block; font-size: 16px; line-height: 21px; color: #4F4F4F; margin: 0 auto 50px auto;">
          ${this.getHeader()}
        </p>
        <div style="padding: 1em">
          ${this.renderRequestInfo()}
          ${RequestEmail.renderFooter(this.data)}
        </div>
      </div>
      <div style=" height: 130px; border-radius: 0 0 4px 4px; width: 610px; background-color: #FFFFFF; border: 1px solid #F5F5F5; margin: 0 auto 145px auto;">
        <div style=" color: #000000; font-size: 16px; line-height: 100%; height: 100%;">
          <p style="margin: 40px 0 10px 0; color: #4F4F4F;">
            Have a question?
          </p>
          <a href=${process.env.REDIRECT_URL} style="color: #3359DB;">
            support@travela.com
          </a>
        </div>
      </div>
    </div>`;
  }

  async send(recipient, subject, data) {
    this.recipient = recipient;
    this.data = data;
    await this.generateData();

    const mailData = {
      from: `Travela <${process.env.MAIL_SENDER}>`,
      to: `${recipient.email}`,
      subject,
      html: this.generateHTML()
    };
    NotificationEngine.dispatchEmail(mailData);
  }
}

export default RequestEmail;

export class BudgetCheckerEmail extends RequestEmail {
  getHeader() {
    return `
          A <b style=" text-transform: uppercase; ">
            ${this.generateTripType()}
            </b> 
            travel request for <b>${this.request.name}</b> 
            has now been approved by <b>${this.data.managerName} </b>. 
            Kindly advise on availability of budget for this trip.
    `;
  }
}
