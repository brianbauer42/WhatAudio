# What Audio
UNDER CONSTRUCTION  
I've long admired the format of leftasrain.com and wanted to build something similar. I'm finally setting out to do that.

## Setup Instructions:
Make sure to **npm install** the dependencies from within the program's directory.

Rename **config_example.js** to **config.js**

In **config.js**:  
The **sessionSecret** variable must contain a random string within quotes.  
Set the **mongoUri** variable to point to your instance of mongodb.

In **package.json**, in **scripts.build:webpack**:  
change '**development**' to '**production**'  
change webpack.config.**dev**.js to webpack.config.**prod**.js

Navigate to the download location in your terminal and type **npm run go**

If the server is in production mode and no running on port 80, verify that the NODE_ENV environment
variable is set to 'production' by setting it manually in your terminal.  
```
Linux/OSX: export NODE_ENV=production
Windows: set NODE_ENV=production
```
