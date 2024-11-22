const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config("../development/.env");
const isProduction = process.env.NODE_ENV === "production";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation", // Set your API title
      version: "1.0.0", // Set your API version
      description: "API documentation for your project", // Add a description for your API
    },
    servers: [
      {
        url: `${process.env.SWAGGER_PATH || "http://localhost:3000"}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production Server"
            : "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: isProduction
    ? ["../src/Controller/*.js", "./src/models/*.js", "./src/routes/*.js"]
    : [
        "./../src/Controller/*.js",
        "./../src/models/*.js",
        "./../src/routes/*.js",
      ],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpecs;
