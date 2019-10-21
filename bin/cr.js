#!/usr/bin/env node
const CronAllowedRange = require('../src');

const usage = `Usage: $0 -e [cron-like expression]

* represents any value
, separator (e.g. 5,6)
- used to define (inclusive) ranges (e.g. 5-9)
/ not supported

┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *`;

const argv = require('yargs')
  .usage(usage)
  .example('$0 -e "* 9-17 * * *"', 'Check if current date time is between 9 AM to 5 PM (UTC)')
  .alias('h', 'help')
  .demandOption(['e'])
  .alias('e', 'expression')
  .describe('e', 'Cron-like expression')
  .argv;

const cr = new CronAllowedRange(argv.expression);
if(cr.isDateAllowed(new Date())) {
  process.exit(0);
} else {
  process.exit(1);
};
