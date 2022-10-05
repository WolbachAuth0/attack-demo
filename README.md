
# Okta CIC Attack Demo

The purpose of this project is to provide a tool for demonstrating
the security features of the Okta Consumer Identity Cloud. This script
gives a convenient command line tool which simulates various sign-on
attacks.


## Environment Variables

To run this project you will need a seperate .env file for each CIC
tenant you wish to simulate attacks against.

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

![Attack Demo Scripts M2M](https://github.com/WolbachAuth0/attack-demo/blob/main/public/folder-structure.png?raw=true)


```txt
TENANT_NAME=<your-tenant-name>
AUTH0_DOMAIN=<m2m-application-domain>
AUTH0_CLIENT_SECRET=<m2m-application-client-secret>
AUTH0_CLIENT_ID=<m2m-application-client-id>
```

## Acknowledgements

 - [Awesome Readme Templates](https://awesomeopensource.com/project/elangosundar/awesome-README-templates)
 - [Awesome README](https://github.com/matiassingers/awesome-readme)
 - [How to write a Good readme](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)

