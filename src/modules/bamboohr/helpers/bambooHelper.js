/* eslint no-await-in-loop: 0 */
import debug from 'debug';
import UserHelper from '../../../helpers/user/index';
/* istanbul ignore file */

const logger = debug('log');

class BambooHelpers {
  static async getBambooUser(id, repeatHandler) {
    try {
      const response = await UserHelper.getUserOnBamboo(id);
      return response.data;
    } catch (error) {
      return BambooHelpers.handleBambooError(error, id, repeatHandler);
    }
  }
  
  static async handleBambooError(error, id, repeatHandler) {
    const { status } = error.response;
    if (status === 502 || status === 503 || status === 429) {
      let repeatResponse;
      if (repeatHandler) {
        repeatResponse = await repeatHandler.handleRepeatRequest();
      } else {
        const newRepeatHandler = new BambooHelpers.BambooErrorHandler(id);
        repeatResponse = await newRepeatHandler.handleRepeatRequest();
      }
      return repeatResponse;
    }
    throw error;
  }

  static async sleep(ms) {
    return new Promise((resolve) => {
      logger(`Sleeping for ${ms / 1000} seconds...`);
      setTimeout(() => {
        logger(`Slept for ${ms / 1000} seconds. Trying to fetch bamboo data again...`);
        resolve();
      }, ms);
    });
  }
}

BambooHelpers.BambooErrorHandler = class {
  constructor(id) {
    this.handleRepeatRequest = this.handleRepeatRequest.bind(this);
    this.repeatCount = 0;
    this.repeatFlag = false;
    this.id = id;
  }
 
  async handleRepeatRequest() {
    let repeatResponse;
    while (!repeatResponse) {
      if (this.repeatFlag) {
        if (this.repeatCount >= 5) {
          throw new Error(
            `Now exiting because the API call to BambooHR  was repeated ${
              this.repeatCount
            } times and still failed.`
          );
        }
        await BambooHelpers.sleep(60000);
        this.repeatCount += 1;
        repeatResponse = await BambooHelpers.getBambooUser(this.id, this);
      } else {
        await BambooHelpers.sleep(60000);
        this.repeatFlag = true;
        this.repeatCount += 1;
        repeatResponse = await BambooHelpers.getBambooUser(this.id, this);
      }
    }
    return repeatResponse;
  }
};
export default BambooHelpers;
