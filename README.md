# [What Audio](https://beta.what.audio)
At this stage, it works well in Chrome, FireFox, and Opera, but Safari and Edge do not support FLAC streaming. 
DM me if you are interested in an admin code to try out my instance at http://what.audio before setting up your own, or if I can clarify any instructions!

I've long admired the format of leftasrain.com and wanted to build something similar for my own use.

## Setup Instructions:
Make sure to **npm install** the dependencies from within the program's directory.

Rename **config_example** to **config.ts**

In **config.ts**:  
The **sessionSecret** variable must contain a random string within quotes.
Set the **mongoUri** variable to point to your instance of mongodb.

Build and start the server in a production environment with the following command:
```
npm run prod
```

Or start it for development (automatically rebuild when changes are detected) with:
```
npm run dev
```

The first time you run the server (or when the user database is empty), an invite code will be generated so that you can create the initial admin account with your own credentials.
