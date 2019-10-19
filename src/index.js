function parsePart(part) {
  if(part === '*') {
    return null;
  }

  const pairStrs = part.split(',');
  return pairStrs.map(pairStr => {
    const pair = pairStr.split('-');
    if(pair.length !== 2) {
      throw new Error(`Part '${part}' has invalid pair '${pairStr}'.`);
    }

    const range = { start: parseInt(pair[0]), end: parseInt(pair[1]) };
    if(isNaN(range.start)) {
      throw new Error(`Part '${part}' has non-integer start range '${range.start}.`);
    }
    if(isNaN(range.end)) {
      throw new Error(`Part '${part}' has non-integer end range '${range.end}.`);
    }

    return range;
  });
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
}
