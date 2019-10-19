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

function isWithinRange(value, start, end) {
  if(start === end) {
    return value === start;
  }

  return start < end
    ? value >= start && value <= end
    : value >= start || value <= end;
}

function isWithinARange(value, ranges) {
  if(!ranges) {
    return true;
  }

  return ranges.some(({ start, end }) => isWithinRange(value, start, end));
}

module.exports = class {
  constructor(expression) {
    const parts = expression.trim().split(' ');
    if(parts.length !== 5) {
      throw new Error(
        `Invalid expression '${expression}.' There should be exactly 5 space-delimited parts.`
      );
    }

    this.minute = parsePart(parts[0]);
    this.hour = parsePart(parts[1]);
    this.dayOfMonth = parsePart(parts[2]);
    this.month = parsePart(parts[3]);
    this.dayOfWeek = parsePart(parts[4]);
  }

  isDateAllowed(date) {
    return isWithinARange(date.getUTCMinutes(), this.minute) &&
      isWithinARange(date.getUTCHours(), this.hour) &&
      isWithinARange(date.getUTCDate(), this.dayOfMonth) &&
      isWithinARange(date.getUTCMonth() + 1, this.month) &&
      isWithinARange(date.getUTCDay(), this.dayOfWeek);
  }
}
