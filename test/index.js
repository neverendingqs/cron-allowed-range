const assert = require('chai').assert;

const CronAllowedRange = require('../src/index');

describe('cron-allowed-range', function() {
  describe('constructor()', function() {
    ['hello world', '* * * *'].forEach(expression => {
      it(`throws error on invalid expression '${expression}'`, function() {
        assert.throws(
          () => new CronAllowedRange(expression),
          `${expression}`
        );
      });
    });

    it('throws error on non-string parameter', function() {
      assert.throws(() => new CronAllowedRange({}));
    });

    it('throws error on invalid timezone', function() {
      assert.throws(() => new CronAllowedRange('* * * * *', 'not-a-valid-tz'));
    });

    it('trims the expression before splitting', function() {
      const cr = new CronAllowedRange(' * * * * * ');
      assert.sameOrderedMembers(
        [null, null, null, null, null],
        [cr.minute, cr.hour, cr.dayOfMonth, cr.month, cr.dayOfWeek]
      );
    });

    ['5-6-7', '{}', 'a-b', 'a-5', '5 - 6', '3-d'].forEach(part => {
      it(`throws error on invalid part '${part}'`, function() {
        assert.throws(() => new CronAllowedRange(`* * ${part} * *`));
      });
    });

    it('sets "null" for part when it encounters "*"', function() {
      const cr = new CronAllowedRange('* * * * *');
      assert.sameOrderedMembers(
        [null, null, null, null, null],
        [cr.minute, cr.hour, cr.dayOfMonth, cr.month, cr.dayOfWeek]
      );
    });

    it('sets singleton ranges properly', function() {
      const cr = new CronAllowedRange('1-2 3-4 5-6 7-8 9-10');
      assert.sameDeepMembers(cr.minute, [{ start: 1, end: 2 }]);
      assert.sameDeepMembers(cr.hour, [{ start: 3, end: 4 }]);
      assert.sameDeepMembers(cr.dayOfMonth, [{ start: 5, end: 6 }]);
      assert.sameDeepMembers(cr.month, [{ start: 7, end: 8 }]);
      assert.sameDeepMembers(cr.dayOfWeek, [{ start: 9, end: 10 }]);
    });

    it('sets parts with multiple ranges properly', function() {
      const cr = new CronAllowedRange('1-2,3-4 5-6,7-8 9-10,11-12 13-14,15-16,17-18 19-20');
      assert.sameDeepMembers(
        cr.minute,
        [{ start: 1, end: 2 }, { start: 3, end: 4 }]
      );
      assert.sameDeepMembers(
        cr.hour,
        [{ start: 5, end: 6 }, { start: 7, end: 8 }]
      );
      assert.sameDeepMembers(
        cr.dayOfMonth,
        [{ start: 9, end: 10 }, { start: 11, end: 12 }]
      );
      assert.sameDeepMembers(
        cr.month,
        [{ start: 13, end: 14 }, { start: 15, end: 16 }, { start: 17, end: 18 }]
      );
      assert.sameDeepMembers(
        cr.dayOfWeek, [{ start: 19, end: 20 }]
      );
    });

    it('supports both singleton values, ranges, and "*" in the same expression', function() {
      const cr = new CronAllowedRange('2 3-4 5-6,7-8 9-10 *');
      assert.sameDeepMembers(cr.minute, [{ start: 2, end: 2 }]);
      assert.sameDeepMembers(cr.hour, [{ start: 3, end: 4 }]);
      assert.sameDeepMembers(cr.dayOfMonth, [{ start: 5, end: 6 }, { start: 7, end: 8 }]);
      assert.sameDeepMembers(cr.month, [{ start: 9, end: 10 }]);
      assert.isNull(cr.dayOfWeek);
    });

    it('ignores other ranges if a part has "*"', function() {
      const cr = new CronAllowedRange('2 3-4 5-6,7-8 9-10 *,11-12');
      assert.sameDeepMembers(cr.minute, [{ start: 2, end: 2 }]);
      assert.sameDeepMembers(cr.hour, [{ start: 3, end: 4 }]);
      assert.sameDeepMembers(cr.dayOfMonth, [{ start: 5, end: 6 }, { start: 7, end: 8 }]);
      assert.sameDeepMembers(cr.month, [{ start: 9, end: 10 }]);
      assert.isNull(cr.dayOfWeek);
    });
  });

  describe('isDateAllowed()', function() {
    describe('minutes', function() {
      const cr = new CronAllowedRange('11-20,25 * * * *');

      [11, 15, 20, 25].forEach(minutes => {
        it(`returns true when within range (${minutes})`, function() {
          const date = new Date(`December 18, 1995 08:${minutes}:59 GMT-0000`);
          assert.isTrue(
            cr.isDateAllowed(date)
          );
        });
      });

      [10, 21, 24, 26].forEach(minutes => {
        it(`returns false when not within range (${minutes})`, function() {
          const date = new Date(`December 18, 1995 08:${minutes}:59 GMT-0000`);
          assert.isFalse(
            cr.isDateAllowed(date)
          );
        });
      });
    });

    describe('hour', function() {
      const cr = new CronAllowedRange('* 11-20,23 * * *');

      [11, 15, 20, 23].forEach(hour => {
        it(`returns true when within range (${hour})`, function() {
          const date = new Date(`December 18, 1995 ${hour}:10:59 GMT-0000`);
          assert.isTrue(
            cr.isDateAllowed(date)
          );
        });
      });

      [10, 21, 22, 24].forEach(hour => {
        it(`returns false when not within range (${hour})`, function() {
          const date = new Date(`December 18, 1995 ${hour}:10:59 GMT-0000`);
          assert.isFalse(
            cr.isDateAllowed(date)
          );
        });
      });
    });

    describe('day of month', function() {
      const cr = new CronAllowedRange('* * 11-20,25 * *');

      [11, 15, 20, 25].forEach(dayOfMonth => {
        it(`returns true when within range (${dayOfMonth})`, function() {
          const date = new Date(`December ${dayOfMonth}, 1995 08:10:59 GMT-0000`);
          assert.isTrue(
            cr.isDateAllowed(date)
          );
        });
      });

      [10, 21, 24, 26].forEach(dayOfMonth => {
        it(`returns false when not within range (${dayOfMonth})`, function() {
          const date = new Date(`December ${dayOfMonth}, 1995 08:10:59 GMT-0000`);
          assert.isFalse(
            cr.isDateAllowed(date)
          );
        });
      });
    });

    describe('month', function() {
      const cr = new CronAllowedRange('* * * 11-2,4 *');

      ['November', 'January', 'February', 'April'].forEach(month => {
        it(`returns true when within range (${month})`, function() {
          const date = new Date(`${month} 18, 1995 08:10:59 GMT-0000`);
          assert.isTrue(
            cr.isDateAllowed(date)
          );
        });
      });

      ['October', 'March', 'May'].forEach(month => {
        it(`returns false when not within range (${month})`, function() {
          const date = new Date(`${month} 18, 1995 08:10:59 GMT-0000`);
          assert.isFalse(
            cr.isDateAllowed(date)
          );
        });
      });
    });

    describe('day of week', function() {
      const cr = new CronAllowedRange('* * * * 1-3,5');

      [1, 3, 5].forEach(dayOfWeek => {
        it(`returns true when within range (${dayOfWeek})`, function() {
          const day = 17 + dayOfWeek;
          const date = new Date(`December ${day}, 1995 08:10:59 GMT-0000`);
          assert.isTrue(
            cr.isDateAllowed(date)
          );
        });
      });

      [0, 4, 6].forEach(dayOfWeek => {
        it(`returns false when not within range (${dayOfWeek})`, function() {
          const day = 17 + dayOfWeek;
          const date = new Date(`December ${day}, 1995 08:10:59 GMT-0000`);
          assert.isFalse(
            cr.isDateAllowed(date)
          );
        });
      });
    });

    describe('expression with UTC', function() {
      [
        {
          date: new Date('December 18, 1995 08:59:59 GMT-0000'),
          reason: 'it is before 9 AM'
        },
        {
          date: new Date('December 18, 1995 18:00:00 GMT-0000'),
          reason: 'it is after 5 PM'
        },
        {
          date: new Date('July 18, 1995 08:30:00 GMT-0000'),
          reason: 'it is on July'
        },
        {
          date: new Date('December 18, 1995 09:30:00 GMT+0100'),
          reason: 'it is before 9 AM UTC time'
        },
        {
          date: new Date('December 16, 1995 09:30:00 GMT-0000'),
          reason: 'it is a Saturday'
        },
        {
          date: new Date('December 17, 1995 09:30:00 GMT-0000'),
          reason: 'it is a Sunday'
        },
      ].forEach(({ date, reason }) => {
        it(`returns false because ${reason}`, function() {
          /* Allowed if it is:
          * - At any minute
          * - Between 9 AM - 6 PM
          * - On any day of the month
          * - Between September to June or on August
          * - Between Monday to Friday
          */
          const cr = new CronAllowedRange('* 9-17 * 9-6,8 1-5');

          const actual = cr.isDateAllowed(date);
          assert.isFalse(actual);
        });
      });

      [
        new Date('December 18, 1995 09:00:00 GMT-0000'),
        new Date('August 18, 1995 17:00:00 GMT-0000')
      ].forEach(date => {
        it(`returns true for ${date}`, function() {
          /* Allowed if it is:
          * - At any minute
          * - Between 9 AM - 6 PM
          * - On any day of the month
          * - Between September to June or on August
          * - Between Monday to Friday
          */
          const cr = new CronAllowedRange('* 9-17 * 9-6,8 1-5');
          const actual = cr.isDateAllowed(date);
          assert.isTrue(actual);
        });
      });
    });

    describe('expressions with timezones', function() {
      [
        {
          expression: '* 9-17 * * 1-5',
          timezone: 'America/Toronto',
          date: new Date('October 23, 2019 18:00:00 GMT-0400'),
          reason: 'it is one hour past the allowed range (using GMT-0500)'
        },
        {
          expression: '* 9-17 * * 1-5',
          timezone: 'America/Toronto',
          date: new Date('October 23, 2019 08:59:59 GMT-0400'),
          reason: 'it is one hour before the allowed range (using GMT-0500)'
        },
        {
          expression: '* 9-17 * * 1-5',
          timezone: 'America/Toronto',
          date: new Date('October 23, 2019 22:00:00 GMT-0000'),
          reason: 'it is one hour past the allowed range (using GMT-0000)'
        },
        {
          expression: '* 9-17 * * 1-5',
          timezone: 'America/Toronto',
          date: new Date('October 23, 2019 12:59:59 GMT-0000'),
          reason: 'it is one hour before the allowed range (using GMT-0000)'
        },
        {
          expression: '* 9-17 * * 1-5',
          timezone: 'America/Toronto',
          date: new Date('December 18, 1995 13:59:59 GMT-0000'),
          reason: 'it is one hour before the allowed range (using GMT-0000)'
        },
        {
          expression: '* 9-17 * * 1-5',
          timezone: 'America/Toronto',
          date: new Date('December 18, 1995 23:00:00 GMT-0000'),
          reason: 'it is one hour past the allowed range (using GMT-0000)'
        }

      ].forEach(({ expression, timezone, date, reason }) => {
        it(`returns false because ${reason}`, function() {
          const cr = new CronAllowedRange(expression, timezone);
          const actual = cr.isDateAllowed(date);
          assert.isFalse(actual);
        });
      });

      [
        new Date('December 18, 1995 09:00:00 GMT-0500'),
        new Date('August 18, 1995 17:00:00 GMT-0400')
      ].forEach(date => {
        it(`returns true for ${date}`, function() {
          /* Allowed if it is:
          * - At any minute
          * - Between 9 AM - 6 PM
          * - On any day of the month
          * - Between September to June or on August
          * - Between Monday to Friday
          */
          const cr = new CronAllowedRange('* 9-17 * * 1-5', 'America/Toronto');
          const actual = cr.isDateAllowed(date);
          assert.isTrue(actual);
        });
      });

    });
  });
});
