## Tenant Folders

You can set up environments in this code base so that the attack-demo can 
opperate on as many different tenants as you like. Simply create a seperate folder in the `/src/tenants` directory for each tenant you want to use and
put the `.env` file for that tenant in the folders.

When you run the attack simulation, you will be presented with a choice of 
tenants to attack. The options shown to you will be the names of the folders
you have created here.

For example, 

![Tenant Environments](https://github.com/WolbachAuth0/attack-demo/blob/main/public/folder-structure.png?raw=true)