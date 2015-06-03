import App         from '../../App'
import ItemActions from '../items'
import ListActions from '../lists'

describe.skip('Item Actions', function() {
  var app;

  beforeEach(function(done) {
    app = new App()
    app.start(done)
  })

  describe('when sent a ItemActions.add message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.get(['lists', 0]).id })
    })

    it ('should create a new item with the proper name', function() {
      app.get(['items', 0, 'name']).should.equal(name)
    })

  })

  describe('when sent a ItemActions.remove message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.get(['lists', 0, 'id']) })
      app.push(ItemActions.remove, app.get(['items', 0, 'id']))
      console.log(app.get('items'))
    })

    it ('remove the item by id', function() {
      app.get('items').length.should.equal(0)
    })

  })

})
