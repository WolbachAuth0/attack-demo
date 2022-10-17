
# Okta CIC Attack Demo

The purpose of this project is to provide a tool for demonstrating the security features of the Okta Consumer Identity Cloud. This script gives a convenient command line tool which simulates various sign-on attacks.

## Attacks Simulated

The purpose of this library is to perform demonstrations of Okta CIC security features (security center, bot detection, brute force detection, etc.). Hence the various attack simulation options are designed to simulate the events that are tracked by these features. 

This library can bulk simulate the events below which the Okta CIC platform recognizes as attacks. Please note that each of these events can occur on accident in normal use - we have all put our passwords in incorrectly or messed up a captcha. But when these events occur in bulk, or 

**Failed Logins:**
Occurs when a user fails to login. When that happens, for example when an existing user enters an incorrect password or when an unregistered user attempts to login, the Okta CIC Security Center will flag that event as a "Credential Stuffing" attack.

**Failed Signups:**
Occurs when an attempt to register a new user fails. When a new user registration event fails, for example when a captcha is failed during signup, the Okta CIC Security Center will flag that event as a "Signup Attack".

**Failed 2FA:**
Occurs when an attempt to enter a second factor of authentication fails. When this happens, for example when a user receives an MFA code via SMS, email or TOTP but mis-enters it into the provided form, the Okta CIC Security Center flags that event as an "MFA Bypass" attack.

#### Brute Force Attack

An attempt to compromise a specific user's credentials by guessing and checking that user's password. It generally appears as many attempts of a single user to login.  

#### Credential Stuffing Attack

An attempt to compromise the credentials of many users by attempting to login as those users with credentials they have found elsewhere. This attack presents itself as many failed logins from many users over a short period of time.

#### Fraudulent Registration Attack

Occurs when a bad actor attempts to create new accounts which the attacker can control. It usually appears as many failed signup events over a short period of time.

#### MFA Bypass Attack

Occurs when a bad actor has successfully compromised a user's first factor of authentication (e.g. username + password), but hasn't compromised their second factor (e.g. the user's phone, email, totp provider or biometrics). This kind of attack presents itself as a group of failed 2FA events over a short period of time.

## Installation

Before attempting to install this project make sure you have installed
[Node.js](https://nodejs.org/) version 16.14.X or higher. Open a command
line terminal and cd to the directory where you want to hold this code base.

Clone this repository, 
```bash
  git clone https://github.com/WolbachAuth0/attack-demo.git
```

Go to the project directory

```bash
  cd attack-demo
```

Install dependencies

```bash
  npm install
```

## Set Up

To run this project you will need a seperate `.env` file for each CIC
tenant you wish to simulate attacks against. You can set up the attack
demo to run agains as many CIC tenants as you want. You need only to 
follow the instructions below for each of your tenants.

### Configure CIC Tenant

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

![Scopes](https://github.com/WolbachAuth0/attack-demo/blob/main/public/scopes.png?raw=true)

Then go to the settings tab of the M2M application and make a note of
the `Domain`, `Client ID`, `Client Secret`.

### Add Environment Variables

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

For more detail, see [THIS](https://github.com/WolbachAuth0/attack-demo/tree/main/src/tenants)

You're now ready to simulate attacks against your tenant.

## Run Locally

From a terminal, cd into the attack-demo directory and run

```bash
  npm run start
```

the attack demo tool will execute.

![Demo](https://github.com/WolbachAuth0/attack-demo/blob/main/public/Attack-Demo.gif?raw=true)

## Resources

 - [Attack Protection](https://auth0.com/docs/secure/attack-protection)
 - [Auth0 Authentication API Docs](https://auth0.com/docs/api/authentication)
 - [Auth0 nodejs SDK Docs](https://auth0.github.io/node-auth0/index.html)
 - [Readme.so](https://readme.so)
 


