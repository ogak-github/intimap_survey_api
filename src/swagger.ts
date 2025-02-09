import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";


const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Merauke API",
      version: "1.0.0",
      description: "BASE URL: http://localhost:3000/api",
    },
    servers: [
      {
        url: "http://localhost:3000/api", // Change this based on your environment
        description: "Local server",
      }
    ],

  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export function swaggerDocumentation(app: Express) { 
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}