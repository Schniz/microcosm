let Microcosm  = require('../Microcosm')

describe('When dispatching promises', function() {
  let add   = n => Promise.resolve(n)
  let error = n => Promise.reject(n)
  let chain = n => Promise.resolve(n).then(n => Promise.resolve(n + 1))
  let app;

  let TestStore = {
    getInitialState: () => 1,
    register() {
      return {
        [add]   : (a, b) => a + b,
        [chain] : (a, b) => b
      }
    }
  }

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('test', TestStore)
    app.start(done)
  })

  it ('properly reduces from a store', function(done) {
    app.listen(function() {
      app.get('test').should.equal(app.stores.test.getInitialState() + 2)
      done()
    }).push(add, 2)
  })

  it ('does not dispatch if the promise fails', function(done) {
    sinon.spy(app, 'dispatch')

    app.push(error)

    requestAnimationFrame(function() {
      app.dispatch.should.not.have.been.called
      done()
    })
  })

  it ('waits for all promises in the chain to resolve', function(done) {
    sinon.spy(app, 'dispatch')

    app.push(chain, 1)

    requestAnimationFrame(function() {
      app.get('test').should.equal(2)
      done()
    })
  })
})
