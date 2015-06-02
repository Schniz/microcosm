let Action     = require('./fixtures/Action')
let DummyStore = require('./fixtures/DummyStore')
let Microcosm  = require('../Microcosm')

describe('Microcosm', function() {
  let app;

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('dummy', DummyStore)
    app.start(done)
  })

  describe('::replace', function() {
    it ('runs deserialize before committing results', function(done) {
      let spy    = sinon.spy(app, 'deserialize')
      let sample = { dummy: 'test' }

      app.listen(function() {
        spy.should.have.been.calledWith(sample)
        app.get('dummy').should.equal('test')
        done()
      })

      app.replace(sample)
    })
  })

  describe('::push', function() {
    it ('throws an error if asked to push a non-function value', function(done) {
      try {
        app.push(null)
      } catch(x) {
        x.should.be.instanceof(TypeError)
        done()
      }
    })
  })

  describe('::dispatch', function() {
    it ('commits changes if a store changes', function(done) {
      app.listen(function() {
        app.get('dummy').should.equal('wut')
        done()
      })
      app.push(Action, 'wut')
    })

    it ('does not commit a change if no store changes', function(done) {
      sinon.spy(app, 'volley')

      app.push(Action, app.get('dummy'))

      requestAnimationFrame(function() {
        app.volley.should.not.have.been.called
        done()
      })
    })
  })

  describe('::addPlugin', function() {
    it ('pushes a plugin into a list', function(done) {
      let app = new Microcosm()

      app.addPlugin({
        register(app, options, next) {
          done()
        }
      })

      app.start()
    })
  })

  describe('::serialize', function() {
    it ('can serialize to JSON', function() {
      sinon.spy(app, 'serialize')

      let data = app.toJSON()

      data.should.have.property('dummy', 'test')
      app.serialize.should.have.been.called
    })

    it ('runs through serialize methods on stores', function() {
      app.addStore('serialize-test', {
        getInitialState() {
          return 'this will not display'
        },
        serialize() {
          return 'this is a test'
        }
      })

      app.toJSON().should.have.property('serialize-test', 'this is a test')
    })
  })

  describe('::deserialize', function() {
    [ null, undefined ].forEach(function(type) {
      it (`handles cases where the value is ${ type }`, function() {
        app.addStore('fiz', {})

        let cleaned = app.deserialize(type)

        cleaned.should.not.have.property('fiz')
      })
    })
  })

  describe('::start', function() {
    it ('can run multiple callbacks', function(done) {
      let app = new Microcosm()
      let a   = sinon.mock()
      let b   = sinon.mock()

      app.start(a, b, function() {
        a.should.have.been.called
        b.should.have.been.called
        done()
      })
    })

    it ('throws an error if given a non-function callback', function() {
      let app = new Microcosm()

      try {
        app.start('this will break')
      } catch(error) {
        error.should.be.instanceof(TypeError)
        error.message.should.include('start')
      }
    })
  })

})
