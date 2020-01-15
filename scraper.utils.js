const moment = require("moment");

class InvalidDate extends Error {};

const spanishStringDateToTimestamp = date => {
  const regex = /^(?<day>\d+)\s\w+\s(?<month>\w+)\s\w+\s(?<year>\d+)/g;
  const result = regex.exec(date);

  if(result === null || !('groups' in result)) {
    throw new InvalidDate();
  }

  const {day, month, year} = result.groups;
  
  return moment.utc(`${year}-${month}-${day}`, 'YYYY-MMM-DD', 'es').unix();
}

module.exports = {
  InvalidDate,
  spanishStringDateToTimestamp
}