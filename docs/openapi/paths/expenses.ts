import { EXPENSE_PERIODS } from "@/features/expenses/expense-interval";

import { schemaRef, uuidInParams } from "../schema";
import { body, defaultResponses, response } from "../schema/utils";

const postExpense = {
  operationId: "createExpense",
  summary: "Create a new expense",
  requestBody: body(schemaRef("CreateExpenseRequest")),
  responses: {
    201: response("Created", schemaRef("ExpenseResponse")),
    ...defaultResponses(),
  },
  tags: ["expenses"],
};

const putExpense = {
  operationId: "updateExpense",
  summary: "Updates an existing expense",
  parameters: [uuidInParams()],
  requestBody: body(schemaRef("UpdateExpenseRequest")),
  responses: {
    200: response("OK", schemaRef("ExpenseResponse")),
    404: response("Resource not found"),
    ...defaultResponses(),
  },
  tags: ["expenses"],
};

const deleteExpense = {
  operationId: "deleteExpense",
  summary: "Deletes an existing expense",
  parameters: [uuidInParams()],
  responses: {
    204: response("No Content"),
    404: response("Resource not found"),
    ...defaultResponses(),
  },
  tags: ["expenses"],
};

const getExpenses = {
  operationId: "getExpenses",
  summary: "Retrieve expenses",
  parameters: [
    {
      in: "query",
      name: "reference",
      required: true,
      description: "The reference date to start the period from.",
      schema: {
        type: "string",
        format: "date",
        example: new Date().toISOString().substring(0, 10),
      },
    },
    {
      in: "query",
      name: "period",
      required: true,
      description: "The period to retrieve expenses for.",
      schema: {
        type: "string",
        enum: EXPENSE_PERIODS,
        example:
          EXPENSE_PERIODS[Math.floor(Math.random() * EXPENSE_PERIODS.length)],
      },
    },
  ],
  description:
    "Retrieve expenses based on query parameters for reference date and period.",
  responses: {
    200: response("OK", schemaRef("ListExpensesResponse")),
    ...defaultResponses(),
  },
  tags: ["expenses"],
};

export const expensePaths = {
  "/expenses": { post: postExpense, get: getExpenses },
  "/expenses/{id}": { put: putExpense, delete: deleteExpense },
};
