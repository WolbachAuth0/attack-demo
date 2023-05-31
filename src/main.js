const Tenant = require('./models/Tenant')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Attacker = require('./models/Attacker')
const scopes = [
  'read:clients',
  'read:client_keys',
  'read:connections'
]

main()

async function main () {
  try {
    // prompt user to select the tenant to attack
    const tenant = await chooseTenant()
    const clients = await tenant.getClients()

    // prompt user to select which SPA, Web App or Mobile app to attack
    const application = await chooseApplication(clients)
    const client = clients.find(x => x.name == application.name)

    // prompt user to select which connection to attack
    const connection = await chooseConnection(tenant, client)
    
    const attackType = await inquirer
      .prompt([
        {
          type: 'list',
          name: 'name',
          message: 'Select type of attack to perform:',
          choices: [
            { name: 'Brute Force' },
            { name: 'Credential Stuffing' },
            { name: 'Fraudulent Sign-ups' }
          ]
        },
      ])
    
     // instantiate attacker
    const attacker = new Attacker({ connection, tenant, client })

    if (attackType.name == 'Brute Force') {
      runBruteForceAttack(attacker)
    } else if (attackType.name == 'Credential Stuffing') {
      runCredentialStuffingAttack(attacker)
    } else if (attackType.name == 'Fraudulent Sign-ups') {
      runFraudulentSignupAttack(attacker)
    }

  } catch (error) {
    handleError(error)
  }
}

async function chooseTenant () {
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
  return tenant
}

async function chooseApplication (clients) {
  const application = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'name',
        message: 'Select the Application to attack:',
        choices: clients
      },
    ])
  return application
}

async function chooseConnection (tenant, client) {
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
  // console.log(connection.options.passwordPolicy)
  // console.log(connection.options.password_complexity_options)
  return connection
}

async function runCredentialStuffingAttack (attacker) {
  
  const attempts = await inquirer
    .prompt([
      {
        type: 'number',
        name: 'name',
        message: 'How many attempts to make? (integer between 1 and 25)',
        default: 10,
        validate: (input) => {
          if (input < 1) {
            return `${input} is less than 1. Please provide an integer between 1 and 25.`
          } else if (input > 25) {
            return `${input} is greater than 25. Please provide an integer between 1 and 25.`
          } else if (!Number.isInteger(input)) {
            return `${input} is not an integer. Please provide an integer between 1 and 25.`
          } else {
            return true
          }
        }
      }
    ])

  await confirmAttack(attacker, {
    type: 'Credential Stuffing Attack',
    email: null,
    attempts: attempts.name
  })

  attacker.credentialStuffing({ attempts: attempts.name })
}

async function runBruteForceAttack (attacker) {
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
        message: 'How many attempts to make? (integer between 1 and 25)',
        default: 10,
        validate: (input) => {
          if (input < 1) {
            return `${input} is less than 1. Please provide an integer between 1 and 25.`
          } else if (input > 25) {
            return `${input} is greater than 25. Please provide an integer between 1 and 25.`
          } else if (!Number.isInteger(input)) {
            return `${input} is not an integer. Please provide an integer between 1 and 25.`
          } else {
            return true
          }
        }
      }
    ])

  await confirmAttack(attacker, {
    type: 'Brute Force Attack',
    email: email.name,
    attempts: attempts.name
  })
  
  attacker.bruteForce({ email: email.name, attempts: attempts.name })
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
  
  await confirmAttack(attacker, {
    type: 'Fraudulent Signup Attack',
    email: null,
    attempts: count.name
  })

  attacker.fraudulentSignups({ count: count.name })
}

async function confirmAttack (attacker, { type, email = null, attempts }) {
  console.log('\n')
  console.log(chalk.bold.underline.blueBright('Attack profile:'))
  console.log('Attack Type: ', chalk.bold.green(type))
  console.log('Auth0 tenant: ', chalk.bold.green(attacker.tenant.name))
  console.log('application: ', chalk.bold.green(`${attacker.client.name} (id= ${attacker.client.client_id})`))
  console.log('connection: ', chalk.bold.green(`${attacker.connection.name} (id= ${attacker.connection.id})`))
  if (email) {
    console.log('email address: ', chalk.bold.green(email))
  }
  console.log('number of attempts: ', chalk.bold.green(attempts))
  console.log('\n')
  
  const proceed = await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'name',
        message: 'Proceed with attack simulation?',
        default: true
      }
    ])

  if (!proceed.name) {
    process.exit(1)
  }
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