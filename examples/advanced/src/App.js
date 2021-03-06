import Items     from './stores/Items'
import Lists     from './stores/Lists'
import Microcosm from 'Microcosm'
import Route     from './stores/Route'

class Todos extends Microcosm {

  constructor() {
    super()

    // Stores modify a global application state object
    // Dispatching actions occurs in the order specified
    // here:

    // 1. Lists
    this.addStore('lists', Lists)

    // 2. List Items
    this.addStore('items', Items)

    // 3. History
    this.addStore('route', Route)
  }

}

export default Todos
