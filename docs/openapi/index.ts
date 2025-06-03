import { expensePaths } from "./paths/expenses";
import { parameters, schemas } from "./schema/common";

export const openApi = {
  openapi: "3.1.0",
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

  paths: {
    // ...userPaths,
    ...expensePaths,
  },

  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas,
    parameters,
  },

  tags: [
    // { name: "users", description: "User related operations" },
    // { name: "wallets", description: "Wallet-only related operations" },
    // { name: "tags", description: "Tag-only related operations" },
    { name: "expenses", description: "Expense operations" },
  ],
};
