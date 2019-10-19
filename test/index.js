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

    ['5', '5-6-7', '{}', 'a-b', 'a-5', '5 - 6', '3-d'].forEach(part => {
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
  });
});
