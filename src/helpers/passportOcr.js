import * as child from 'child_process';
import fs from 'fs';

/*
* Refer to https://en.wikipedia.org/wiki/Machine-readable_passport
*/

export default class PassportOCR {
  static parseMrz(mrz) {
    let country = '';
    let surname = '';
    let names = '';
    let nationality = '';
    let number = '';
    let dateOfBirth = '';
    let expiryDate = '';
    let sex = '';
    if (mrz.length > 1) {
      const line1 = mrz[0];
      const line2 = mrz[1];
      if (line1[0].substring(0, 1) === 'P') {
        country = line1.substring(2, 5).replace(/</g, '');
        const fullName = line1.substring(5);
        const nameArray = fullName.split('<<', 2);
        [surname] = nameArray;
        if (nameArray.length > 1) {
          names = nameArray[1].replace(/</g, ' ').trim();
        }
        number = line2.substring(0, 9).replace(/</g, '');
        nationality = line2.substring(10, 13).replace(/</g, '');
        dateOfBirth = line2.substring(13, 19).replace(/</g, '');
        expiryDate = line2.substring(21, 27).replace(/</g, '');
        sex = line2.substring(20, 21).replace(/</g, '');
      }
    } else return 'null';
    const mrzObject = {
      country,
      surname,
      names,
      dateOfBirth,
      expiryDate,
      sex,
      number,
      nationality
    };
    return mrzObject;
  }

  static async extractMrz(text) {
    let mrz = text.split('\n').filter(item => item.includes('<'));
    mrz = mrz.map(item => item.replace(/\s/g, '').replace(/(KK)/g, '<<').replace(/(\s|\()/g, ''));
    return mrz;
  }

  static async runTesseractCommand(file, callback) {
    let newObject = {};
    const tesserractProccess = await child.spawn('tesseract', [file, 'stdout']);
    tesserractProccess.stdout.on('data', async (data) => {
      const fullText = data.toString('utf-8').trim();
      const mrz = await PassportOCR.parseMrz(await PassportOCR.extractMrz(fullText));
      fs.unlink(file, (error) => {
        if (error) return error;
      });
      newObject = mrz;
      tesserractProccess.on('close', () => callback(newObject));
    });
  }
}
