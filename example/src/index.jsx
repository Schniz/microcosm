import 'style/app'

import App     from 'App'
import Router  from 'plugins/router'
import Storage from 'plugins/storage'
import Render  from 'plugins/render'
import Ledger  from 'plugins/ledger'

// Each app is a unique instance.
// It will get its own state, useful for having multiple apps on
// the same page or for independence between requests
let app = new App()

// Plugins run before an app starts. You can use them to bootstrap
// behavior

// Save to local storage
app.addPlugin(Storage)

// Pushes route actions as they occur
app.addPlugin(Router)

// Store history
app.addPlugin(Ledger)

// Render changes to the screen
app.addPlugin(Render, {
  el: document.getElementById('app')
})

// Starting the application will run through all plugins
app.start()
