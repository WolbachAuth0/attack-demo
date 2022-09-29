const path = require('path')
const fs = require('fs')
const auth0 = require('auth0')

class Tenant {
  constructor ({ scopes, name }) {
    // get the path to the chosen tenant's environment file
    const directory = Tenant.directories.find(tenant => tenant.name == name).path
    const filename = path.join(directory, `./.env`)
    
    // load the environment
    require('dotenv').config({ path: filename })

    // initialize the management API client for the chosen tenant
    const options = {
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      scope: scopes.join(' ')
    }
    const ManagementClient = auth0.ManagementClient
    const management = new ManagementClient(options)
    
    this._name = name
    this._api = management
  }

  static get directories () {
    const root = path.join(__dirname, '../tenants')
    const files = fs.readdirSync(root)
    const directories = files
      .map(file => {
        return { name: file, path: path.join(root, file) }
      })
      .filter(item => fs.statSync(item.path).isDirectory())
    return directories
  }

  get name () { return this._name }
  get api () { return this._api }

  async getClients (app_types = ['spa', 'regular_web']) {
    const clients = await this.api.clients.getAll({ per_page: 10, page: 0 })
    const response = clients
      .filter(client => app_types.includes(client?.app_type))
      .map(client => {
        return {
          client_id: client.client_id,
          name: client.name,
          description: client?.description,
          app_type: client?.app_type,
          logo_uri: client?.logo_uri
        }
      })
    return response
  }

  async getConnectionsForClient (client_id) {
    const connections = await this.api.connections.getAll({ per_page: 50, page: 0, strategy: 'auth0' })
    const response = connections
      .filter(connection => connection.enabled_clients.includes(client_id))
    return response
  }
}
module.exports = Tenant