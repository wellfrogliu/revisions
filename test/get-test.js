var test = require('tape')

  , common = require('./common')
  , runTest = common.runGetTest

test('get() empty', function (t) {
  runTest('empty', [], function (err, revisions) {
    t.deepEqual(revisions, [])
    t.end(err)
  })
})

test('get() one revision', function (t) {
  var inputs = [ { body: 'Hello, world', date: new Date(0) } ]

  runTest('one-revision', inputs, function (err, revisions) {
    t.deepEqual(revisions, inputs)
    t.end(err)
  })
})

test('get() string date', function (t) {
  var inputs = [ { body: 'Hello', date: (new Date(0)).toJSON() } ]

  runTest('string-date', inputs, function (err, revisions) {
    t.deepEqual(revisions, [ { body: 'Hello', date: new Date(0) } ])
    t.end(err)
  })
})

test('get() lots of revisions', function (t) {
  var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello', date: new Date(1000)}
        , { body: 'Hello, world!', date: new Date(2000) }
        , { body: 'foo', date: new Date(3000) }
        , { body: 'foobar', date: new Date(4000) }
      ]

  runTest('lots-of-revisions', inputs, function (err, revisions) {
    t.deepEqual(revisions, [ inputs[2], inputs[4] ])
    t.end(err)
  })
})

test('get() multiple same date', function (t) {
  var inputs = [
          { body: 'foo', date: new Date(0) }
        , { body: 'bar', date: new Date(0) }
      ]

  runTest('same-date', inputs, function (err, revisions) {
    var foo = false
      , bar = false

    revisions.forEach(function (revision) {
      if (revision.body === 'foo') foo = true
      if (revision.body === 'bar') bar = true
    })

    t.equal(foo, true, 'should include foo')
    t.equal(bar, true, 'should include bar')
    t.equal(revisions.length, 2)
    t.end(err)
  })
})

test('get() can return stream', function (t) {
    var inputs = [
          { body: 'Hello', date: new Date(0) }
        , { body: 'Hello, world', date: new Date(1000) }
      ]

  common.populate('get-stream', inputs, function (err, db) {
    var stream = db.get(common.key)

    t.notOk(stream.writable, 'stream should not be writable')
    t.notOk(stream.write, 'stream should not have a write method')

    stream.once('data', function (obj) {
      t.deepEqual(obj, inputs[1])
      stream.once('end', t.end.bind(t))
    })
  })
})
