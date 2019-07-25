import CountryJs from 'countryjs';
import CountryList from 'countries-list';

const countriesFromCountryJs = CountryJs.all();
const countriesFromCountryList = Object.values(CountryList.countries);

export default countriesFromCountryJs.map((country) => {
  const arr = [];
  const countryInCountryList = countriesFromCountryList.find(item => item.name === country.name);
  if (countryInCountryList) {
    arr.push({ ...country, emoji: countryInCountryList.emoji });
  } else {
    arr.push({ ...country });
  }
  return arr;
});
