import Microcosm from 'Microcosm'

let App = new Microcosm()

function fetch(params) {
  return new Promise(function(resolve, reject) {
    setTimeout(_ => resolve(params), 1000)
  })
}

function* createUser({ name }) {
  yield { id: 0, name }
  yield fetch({ id: 1, name })
}

App.addStore('users', {
  getInitialState() {
    return []
  },

  register() {
    return {
      [createUser]: this.addUser
    }
  },

  addUser(users, params) {
    return users.concat(params)
  }
})

App.start()

App.listen(function() {
  console.log(App.get('users'))
})

App.push(createUser, { name: 'Nate' })
