import type { SwaggerOptions } from "@fastify/swagger";

export const swaggerOptions: SwaggerOptions = {
  openapi: {
    info: {
      title: "Expense Tracker API",
      version: "0.0.1",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "development server",
      },
    ],
    security: [
      {
        BearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      // parameters, => not possible
      // schemas, => generated
    },

    tags: [
      { name: "users", description: "User related operations" },
      { name: "wallets", description: "Wallet-only related operations" },
      { name: "tags", description: "Tag-only related operations" },
      { name: "expenses", description: "Expense operations" },
    ],
  },
};
