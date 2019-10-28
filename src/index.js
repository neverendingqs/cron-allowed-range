const moment = require('moment-timezone');

function parsePart(part) {
  if(part === '*') {
    return null;
  }

  const pairStrs = part.split(',');

  if(pairStrs.some(pairStr => pairStr === '*')) {
    return null;
  }

  return pairStrs.map(pairStr => {
    const pair = pairStr.split('-');
    if(pair.length < 1 || pair.length > 2) {
      throw new Error(`Part '${part}' has invalid pair '${pairStr}'.`);
    }

    const start = parseInt(pair[0]);
    if(isNaN(start)) {
      throw new Error(`Part '${part}' has non-integer start range '${pair[0]}'.`);
    }

    const end = pair.length === 1
      ? start
      : parseInt(pair[1]);

    if(isNaN(end)) {
      throw new Error(`Part '${part}' has non-integer end range '${pair[1]}'.`);
    }

    return { start, end };
  });
}

function validatePart(timeElementName, timeElementProperties, timeElementValues){
  let isValid = true;

  if(timeElementValues != null) {
    isValid = timeElementValues
      .reduce((acc,timeElementValue)=> acc.concat(Object.values(timeElementValue)),[])
      .every((element)=> element >= timeElementProperties.min && element <= timeElementProperties.max );
  };

  if(!isValid){
    throw new Error(
      `Invalid time range for ${timeElementName}. Range should be within [${timeElementProperties.min} - ${timeElementProperties.max}].`
    );
  }
}

function isWithinRange(value, start, end) {
  if(start === end) {
    return value === start;
  }

  const isWithinRange = start < end
    ? value >= start && value <= end
    : value >= start || value <= end;

  return isWithinRange;
}

function isWithinARange(value, ranges) {
  if(!ranges) {
    return true;
  }

  return ranges.some(({ start, end }) => isWithinRange(value, start, end));
}

module.exports = class {
  constructor(expression, timezone = 'GMT') {
    const timeElements = {
      minute: {partPosition:0, min:0,max:59},
      hour: {partPosition:1, min:0,max:23},
      dayOfMonth: {partPosition:2, min:1,max:31},
      month: {partPosition:3, min:1,max:12},
      dayOfWeek: {partPosition:4 ,min:0,max:6}
    };

    const parts = expression.trim().split(' ');
    if(parts.length !== 5) {
      throw new Error(
        `Invalid expression '${expression}.' There should be exactly 5 space-delimited parts.`
      );
    }

    if(!moment.tz.zone(timezone)) {
      throw new Error(`Invalid timezone string ${timezone}.`);
    }

    Object.keys(timeElements).forEach((timeElementName)=>{
      const timeElement = timeElements[timeElementName];
      this[timeElementName] = parsePart(parts[timeElement.partPosition]);
      validatePart(timeElementName, timeElement, this[timeElementName]);
    });

    this.timezone = timezone;
  }

  isDateAllowed(date) {
    const dateWithTz = moment(date).tz(this.timezone);
    return isWithinARange(dateWithTz.minute(), this.minute) &&
      isWithinARange(dateWithTz.hour(), this.hour) &&
      isWithinARange(dateWithTz.date(), this.dayOfMonth) &&
      isWithinARange(dateWithTz.month() + 1, this.month) &&
      isWithinARange(dateWithTz.day(), this.dayOfWeek);
  }
}
