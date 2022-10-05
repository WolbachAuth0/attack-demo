
# Okta CIC Attack Demo

The purpose of this project is to provide a tool for demonstrating
the security features of the Okta Consumer Identity Cloud. This script
gives a convenient command line tool which simulates various sign-on
attacks.


## Installation

Before attempting to install this project make sure you have installed
[Node.js](https://nodejs.org/) version 16.14.X or higher. Open a command
line terminal and cd to the directory where you want to hold this code base.
Clone this repository, cd into the attack-demo directory and install the
node dependencies.

```bash
  git clone https://github.com/WolbachAuth0/attack-demo.git
  cd attack-demo
  npm install
```

## Environment Variables

To run this project you will need a seperate `.env` file for each CIC
tenant you wish to simulate attacks against. You can set up the attack
demo to run agains as many CIC tenants as you want. You need only to 
follow the instructions below for each of your tenants.

#### Set Up Your CIC Tenant

In your CIC tenant, create a new M2M application and give it an 
appropriate name (e.g. "Attack Scripts M2M").

![Attack Demo Scripts M2M](https://github.com/WolbachAuth0/attack-demo/blob/main/public/M2M-app.png?raw=true)

Go to the APIs tab of your new M2M application and Authorize the 
tenant's Management API. Make sure to grant (at least) the following
scopes to the connection;

```txt
  'read:clients', 'read:client_keys', 'read:client_grants', 
  'read:connections', 'read:users', 'read:tenant_settings',
  'read:attack_protection'
```

![Attack Demo Scripts M2M](https://github.com/WolbachAuth0/attack-demo/blob/main/public/scopes.png?raw=true)

Then go to the settings tab of the M2M application and make a note of
the `Domain`, `Client ID`, `Client Secret`.

#### Add Your Tenant Environment to Code

Open a terminal and cd into the directory where this code base is 
stored. Then 

```bash
cd <path-to-this-project>/src/tenants
mkdir <name-of-your-tenant>
```

The attack demo will use this folder name when it presents to you the 
choice of which tenants to simulate attacks against. Inside this 
folder, create a `.env` file and add the following data do it.

```txt
TENANT_NAME=<your-tenant-name>
AUTH0_DOMAIN=<m2m-application-domain>
AUTH0_CLIENT_SECRET=<m2m-application-client-secret>
AUTH0_CLIENT_ID=<m2m-application-client-id>
```

You're now ready to simulate attacks against your tenant.

## Acknowledgements

 - [Awesome Readme Templates](https://awesomeopensource.com/project/elangosundar/awesome-README-templates)
 - [Awesome README](https://github.com/matiassingers/awesome-readme)
 - [How to write a Good readme](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)

