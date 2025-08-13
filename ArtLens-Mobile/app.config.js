// ArtLens-Mobile/app.config.js

// Import the dotenv library to read our .env file
require('dotenv').config();

export default ({ config }) => {
  return {
    ...config, // Use the default config from app.json
    // Add our custom variables to the 'extra' field
    extra: {
      backendUrl: process.env.BACKEND_URL,
    },
  };
};