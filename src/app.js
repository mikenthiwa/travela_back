import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import morgan from 'morgan';
import bugsnag from 'bugsnag';
import cloudinary from 'cloudinary';
import expressValidator from 'express-validator';
import modules from './modules';
import MailTravelMembers from './modules/userRole/MailTravelMembers';
import CloudinaryDeletion from './modules/travelChecklist/CloudinaryDeletion';
import ReminderEmails from './modules/reminders/reminderEmails';
import updateUserCron from './modules/bamboohr/updateUserCron';

const app = express();

if (
  !process.env.NODE_ENV.match('test')
  /* istanbul ignore next */
  && process.env.BUGSNAG_API_KEY
) {
  /* istanbul ignore next */
  bugsnag.register(process.env.BUGSNAG_API_KEY);
  /* istanbul ignore next */
  app.use(bugsnag.requestHandler);
  /* istanbul ignore next */
  app.use(bugsnag.errorHandler);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  enhance_image_tag: process.env.CLOUDINARY_ENHANCE_IMAGE,
  static_image_support: process.env.CLOUDINARY_STATIC_IMAGE
});

app.use(cors());
app.use(morgan('dev'));
app.use(passport.initialize());

MailTravelMembers.sendMail();
ReminderEmails.sendMail();
updateUserCron.userUpdate();


CloudinaryDeletion.executeResourceDelete();
// body parser for url params and json
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);
app.use(bodyParser.json());

app.use(expressValidator());

// set base url for api
modules(app);

// catch all routers
app.use('*', (req, res) => res.status(404).json({
  message: 'Not Found. Use /api/v1 to access the Api'
}));

export default app;
