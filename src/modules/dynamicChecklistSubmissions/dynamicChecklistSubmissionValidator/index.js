import flightDetailsValidator from './flightDetailsValidator';
import {
  scale,
  radio,
  checkBox,
} from './typesValidator';

const getValidator = new Map([
  ['scale', scale],
  ['radio', radio],
  ['checkbox', checkBox],
  ['dropdown', radio],
]);

const unvalidatedInputTypes = ['image', 'video'];

const aggregateChecklists = (checklists, separator = []) => checklists
  .reduce((prev, curr) => [...prev, ...curr.config, ...separator], []);

function checklistValidator(item) {
  if (item.isSeparator) {
    this.notApplicable = false;
    return [];
  }
  const newItem = { ...item, notApplicable: this.notApplicable };
  const isValid = (item.response && getValidator.get(item.type)(item));

  this.notApplicable = isValid && item.response.behaviour
    && item.response.behaviour.type === 'SKIP_QUESTION';
  
  return isValid || unvalidatedInputTypes.includes(item.type) || newItem.notApplicable
    ? [newItem] : [];
}
 
export const validator = ({ checklists, trips }) => {
  const aggregatedChecklists = aggregateChecklists(checklists, [{ isSeparator: true }]);

  let validChecklistItems;

  // the Array.flatMap method is faster but also new and environment support is unpredictable
  // we'll fall back to (Array.map + Array.reduce) polyfill
  // as a fallback when Array.flatMap is not supported
  if (Array.prototype.flatMap) {
    validChecklistItems = aggregatedChecklists
      .flatMap(checklistValidator, { notApplicable: false });
  } else {
    validChecklistItems = aggregatedChecklists
      .map(checklistValidator, { notApplicable: false })
      .reduce((acc, curr) => acc.concat(curr));
  }

  const validTrips = trips
    .filter(trip => trip.flightDetails && flightDetailsValidator(trip));

  return [
    validChecklistItems,
    validTrips,
    aggregateChecklists(checklists),
    trips,
  ];
};

export default validator;
