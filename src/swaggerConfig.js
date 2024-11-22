const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config('../development/.env');



const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation', // Set your API title
      version: '1.0.0', // Set your API version
      description: 'API documentation for your project', // Add a description for your API
    },
    servers: [
      {
        url: `${process.env.SWAGGER_PATH}/api`, // Update this with your API base URL
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the files where your routes are defined
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpecs;