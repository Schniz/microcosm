import App         from '../../App'
import ListActions from '../lists'
import ItemActions from '../items'

describe.skip('List Actions', function() {
  var app;

  beforeEach(function(done) {
    app = new App()
    app.start(done)
  })

  describe('when sent a ListActions.add message', function() {
    var name = 'My todo list'

    beforeEach(function() {
      app.push(ListActions.add, { name })
    })

    it ('should create a new list with the proper name', function() {
      app.get('lists')[0].should.have.property('name', name)
    })

  })

  describe('when sent a ListActions.remove message', function() {
    var name = 'My todo list'

    beforeEach(function() {
      app.push(ListActions.add, { name })
      app.push(ListActions.remove, app.get('lists')[0].id)
    })

    it ('should remove the list by id', function() {
      app.get('lists').length.should.equal(0)
    })

  })

  describe('when sent a ListActions.remove message with items', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.get('lists')[0] })
      app.push(ListActions.remove, app.get('lists')[0].id)
    })

    it ('removes all child items', function() {
      app.get('items').length.should.equal(0)
    })

  })
})
