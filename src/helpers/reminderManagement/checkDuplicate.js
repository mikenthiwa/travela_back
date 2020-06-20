import _ from 'lodash';

const checkDuplicates = (reminders) => {
  const frequencies = reminders.map(reminder => reminder.frequency);
  return _.uniq(frequencies).length !== frequencies.length;
};
export default checkDuplicates;
