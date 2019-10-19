const assert = require('chai').assert;

const CronAllowedRange = require('../src/index');

describe('cron-allowed-range', function() {
  describe('constructor', function() {
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
    /* Allowed if it is:
     * - At any minute
     * - Between 9 AM - 5 PM
     * - On any day of the month
     * - Between September to June or on August
     * - Between Monday to Friday
     */
    const cr = new CronAllowedRange('* 9-17 * 9-6,8 1-5');

    [
      {
        date: new Date('December 17, 1995 09:24:00'),
        reason: 'it is a Sunday'
      },
      {
        date: new Date('December 18, 1995 08:59:59'),
        reason: 'it is before 9 AM'
      },
      {
        date: new Date('December 18, 1995 18:24:00'),
        reason: 'it is after 5 PM'
      },
      {
        date: new Date('July 18, 1995 08:24:00'),
        reason: 'it is on July'
      }
    ].forEach(({ date, reason }) => {
      it(`returns false because ${reason}`, function() {
        const actual = cr.isDateAllowed(date);
        assert.isFalse(actual);
      });
    });

    [
      new Date('December 18, 1995 09:00:00'),
      new Date('August 18, 1995 17:00:00')
    ].forEach(date => {
      it(`returns true for ${date}`, function() {
        const actual = cr.isDateAllowed(date);
        assert.isTrue(actual);
      });
    });
  });
});
