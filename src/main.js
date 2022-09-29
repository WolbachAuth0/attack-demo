const Tenant = require('./models/Tenant')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Attacker = require('./models/Attacker')
const scopes = [
  'read:clients',
  'read:client_keys'
]

main()

async function main () {
  try {
    const environment = await inquirer
      .prompt([
        {
          type: 'list',
          name: 'name',
          message: 'Select the Auth0 tenant:',
          choices: Tenant.directories.map(tenant => tenant.name),
        },
      ])
    
    console.log(`\nLoading environment variables for the ${chalk.bold.green(environment.name)} tenant ...`)
    const tenant = new Tenant({ scopes, name: environment.name })
    const clients = await tenant.getClients()
    
    const application = await inquirer
      .prompt([
        {
          type: 'list',
          name: 'name',
          message: 'Select the Application to attack:',
          choices: clients
        },
      ])

    const client = clients.find(x => x.name == application.name)
    const connections = await tenant.getConnectionsForClient(client.client_id)
    let connection = {}
    
    if (connections.length == 0) {
      console.log(`No DB connections were found for the ${chalk.bold.redBright(client.name)} application.`)
      console.log(chalk.bold.bgRed.white(`No connection to attack. Exiting.`))
      process.exit(1)
    } else if (connections.length > 1) {
      console.log(`More than one DB connection was found for the ${chalk.bold.green(client.name)} application.`)
      const choice = await inquirer
        .prompt([
          {
            type: 'list',
            name: 'name',
            message: 'Select the specific DB connection to attack:',
            choices: connections
          }
        ])
      connection = connections.find(x => x.name == choice.name)
    } else {
      connection = connections[0]
    }

    const attacker = new Attacker({ connection, tenant, client })

    const attackType = await inquirer
      .prompt([
        {
          type: 'list',
          name: 'name',
          message: 'Select type of attack to perform:',
          choices: [
            { name: 'Credential Stuffing' },
            { name: 'Fraudulent Sign-ups' }
          ]
        },
      ])
    
      if (attackType.name == 'Credential Stuffing') {
        runCredentialStuffingAttack(attacker)
      } else if (attackType.name == 'Fraudulent Sign-ups') {
        runFraudulentSignupAttack(attacker)
      }

  } catch (error) {
    handleError(error)
  }
}

async function runCredentialStuffingAttack (attacker) {
  const email = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What email address to attack?',
        validate: (input) => {
          if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input)) {
            return (true)
          } else {
            return 'Please enter a valid email address!'
          }
        },
      }
    ])


  const attempts = await inquirer
    .prompt([
      {
        type: 'number',
        name: 'name',
        message: 'How many attempts to make? (integer between 1 and 100)',
        default: 10,
        validate: (input) => {
          if (input < 1) {
            return `${input} is less than 1. Please provide an integer between 1 and 100.`
          } else if (input > 100) {
            return `${input} is greater than 100. Please provide an integer between 1 and 100.`
          } else if (!Number.isInteger(input)) {
            return `${input} is not an integer. Please provide an integer between 1 and 100.`
          } else {
            return true
          }
        }
      }
    ])

  console.log('\n', chalk.bold.underline.blueBright('Begin Auth0 Scripted Attack Attempt'), '\n')
  console.log('Attack Type: ', chalk.bold.green('Credential Stuffing Attack'))
  console.log('email address: ', chalk.bold.green(email.name))
  console.log('number of attempts: ', chalk.bold.green(attempts.name))
  console.log('Auth0 tenant: ', chalk.bold.green(attacker.tenant.name))
  console.log('application: ', chalk.bold.green(`${attacker.client.name} (id= ${attacker.client.client_id})`))
  console.log('connection: ', chalk.bold.green(`${attacker.connection.name} (id= ${attacker.connection.id})`))
  console.log('\n')
  
  attacker.credentialStuffing({ email: email.name, attempts: attempts.name })
}

async function runFraudulentSignupAttack (attacker) {
  const count = await inquirer
    .prompt([
      {
        type: 'number',
        name: 'name',
        message: 'How many attempts to make? (integer between 1 and 100)',
        default: 10,
        validate: (input) => {
          if (input < 1) {
            return `${input} is less than 1. Please provide an integer between 1 and 100.`
          } else if (input > 100) {
            return `${input} is greater than 100. Please provide an integer between 1 and 100.`
          } else if (!Number.isInteger(input)) {
            return `${input} is not an integer. Please provide an integer between 1 and 100.`
          } else {
            return true
          }
        },
        choices: []
      }
    ])
  
  console.log('\n', chalk.bold.underline.blueBright('Begin Auth0 Scripted Attack Attempt'), '\n')
  console.log('Attack Type: ', chalk.bold.green('Fraudulent Signup Attack'))
  console.log('number of sign ups: ', chalk.bold.green(count.name))
  console.log('auth0 tenant: ', chalk.bold.green(attacker.tenant.name))
  console.log('application: ', chalk.bold.green(`${attacker.client.name} (id= ${attacker.client.client_id})`))
  console.log('connection: ', chalk.bold.green(`${attacker.connection.name} (id= ${attacker.connection.id})`))
  console.log('\n')

  attacker.fraudulentSignups({ count: count.name })
}



function handleError (error) {
  console.log(chalk.bold.underline.bgRed.white(error.message))
  
  // handle cases
  if (error?.statusCode >= 400) {
    console.log(error?.message)
    console.log(Object.keys(error))
    console.log('status code: ', error.statusCode)
  } else {
    console.log(error)
  }

  console.log('exiting process.')
  process.exit(1)

}