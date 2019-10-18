const assert = require('chai').assert;

const sut = require('../src/index');

describe('index.js', function() {
  it('returns true', function() {
    assert.isTrue(sut());
  });
});
