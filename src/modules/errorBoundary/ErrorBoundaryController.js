import axios from 'axios';
import slackMessage from './slackMessage';


export default class ErrorBoundaryController {
  static async handleCrash(req, res) {
    const { body } = req;

    try {
      await axios.post(process.env.CRASH_REPORTING_CHANNEL,
        slackMessage(body), {
          headers: {
            'Content-type': 'application/json'
          }
        });
      global.crashReports.push(body.stackTraceId);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unable to send message to the slack channel'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Crash reported successfully to the slack channel'
    });
  }
}
