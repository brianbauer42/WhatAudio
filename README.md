# Infinite
UNDER CONSTRUCTION  
I've long admired the format of leftasrain.com and wanted to build something similar. I'm finally setting out to do that.

## Setup Instructions:
Rename **config_example.js** to **config.js**

In **config.js**:  
The **sessionSecret** variable must contain a random string within quotes.  
Set the **mongoUri** variable to point to your instance of mongodb.

In **package.json**, where it says 'development' in **scripts.build:webpack**, change '**development**' to '**production**'

Navigate to the download location in your terminal and type **npm run go**
