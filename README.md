# What Audio
IN DEVELOPMENT: At this stage, it works well in Chrome, FireFox, and Opera, but Safari and Edge do not support FLAC streaming. I'll add the ability for an admin to disable formats from the admin panel soon if the site operator prefers compatibility.

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

Verify that the NODE_ENV environment variable is set to 'production' by setting it from your terminal.  
```
Linux/OSX: export NODE_ENV=production
Windows: set NODE_ENV=production
```

From inside the download folder in your terminal type **npm run go**
