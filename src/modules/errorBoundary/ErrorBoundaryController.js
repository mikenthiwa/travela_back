import axios from 'axios';
import StackTraceGPS from 'stacktrace-gps';
import request from 'request';
import slackMessage from './slackMessage';


class ErrorBoundaryController {
  static async createStackTrace(stackTrace) {
    const gps = new StackTraceGPS({
      ajax: url => new Promise((resolve, reject) => {
        request({
          url,
          method: 'get'
        },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response.body);
          }
        });
      })
    });
    const info = await Promise.all(
      stackTrace.splice(0, 2).map(async stackFrame => gps.pinpoint(
        stackFrame
      ))
    );

    return info.reduce((acc, current) => `${acc}\n\n${current.toString().replace('@', '\t')}`, '');
  }

  static async handleCrash(req, res) {
    const {
      body: {
        stackTraceId,
        link,
        info: {
          userAgent,
          message
        },
        stackTrace
      }
    } = req;

    try {
      const info = await ErrorBoundaryController.createStackTrace(stackTrace);

      await axios.post(process.env.CRASH_REPORTING_CHANNEL,
        slackMessage({
          stackTrace: info, userAgent, message, stackTraceId, link
        }), {
          headers: {
            'Content-type': 'application/json'
          }
        });
      global.crashReports.push(stackTraceId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Unable to send message to the slack channel'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Crash reported successfully to the slack channel'
    });
  }

  static async clearCrashReports(req, res) {
    global.crashReports = [];
    return res.status(200).json({
      success: true,
      message: 'Crash reports cleared successfully'
    });
  }
}


export default ErrorBoundaryController;
