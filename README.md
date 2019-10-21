[![CircleCI](https://circleci.com/gh/neverendingqs/cron-allowed-range.svg?style=svg)](https://circleci.com/gh/neverendingqs/cron-allowed-range)
[![Coverage
Status](https://coveralls.io/repos/github/neverendingqs/cron-allowed-range/badge.svg?branch=master)](https://coveralls.io/github/neverendingqs/cron-allowed-range?branch=master)
[![npm
version](https://badge.fury.io/js/cron-allowed-range.svg)](https://badge.fury.io/js/cron-allowed-range)

# cron-allowed-range
Use cron-like expressions to test if a datetime is in an allowed range.

## Usage

Note: this library always uses UTC time. It will support timezones in the
future.

### API

```sh
npm install cron-allowed-range
```

```js
const CronAllowedRange = require('cron-allowed-range');

/* Allowed if it is:
 * - At any minute
 * - Between 9 AM - 5 PM
 * - On any day of the month
 * - Between September to June, or on August
 * - Between Monday to Friday
 */
const cr = new CronAllowedRange('* 9-17 * 9-6,8 1-5');

cr.isDateAllowed(new Date('December 18, 1995 08:59:59 GMT-0000'));
// false

cr.isDateAllowed(new Date('August 18, 1995 17:00:00 GMT-0000'));
// true
```

### CLI

```sh
npm install -g cron-allowed-range

cr -e "* 9-17 * * *"

echo $?
# exit code is 0 if within range, otherwise 1
```

## Formatting the Cron-Like Expression

```
* represents any value
, separator (e.g. 5,6)
- used to define (inclusive) ranges (e.g. 5-9)
/ not supported
```

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
│ │ │ │ │
* * * * *
```
<small>_Diagram from
[Wikipedia](https://en.wikipedia.org/wiki/Cron#Overview)_</small>
