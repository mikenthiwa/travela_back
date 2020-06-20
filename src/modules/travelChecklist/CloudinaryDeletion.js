import bugsnag from 'bugsnag';
import cloudinary from 'cloudinary';
import cron from 'node-cron';
import models from '../../database/models';

export default class CloudinaryDeletion {
  static async deleteCloudinaryResources() {
    const ChecklistItemResources = await models.ChecklistItemResource
      .findAll({
        paranoid: false
      });

    ChecklistItemResources.map((resource) => { //eslint-disable-line
      if (resource.deletedAt) {
        cloudinary.v2.api
          .delete_resources_by_tag(resource.label, /* istanbul ignore next */
            (error) => {
              bugsnag.notify(new Error(error));
            });
      }
    });
  }

  /* istanbul ignore next */
  static executeResourceDelete() {
    cron.schedule('* * 23 * *', () => {
      CloudinaryDeletion.deleteCloudinaryResources();
    });
  }
}
