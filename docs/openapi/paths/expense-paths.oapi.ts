import { schemaRef, uuidInParams } from "../schema";
import { body, defaultResponses, response } from "../schema/schema-utils.oapi";

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
  summary: "Retrieve expenses grouped by wallet for a given month",
  parameters: [
    {
      in: "query",
      name: "month",
      required: true,
      description: "Reference month in the format 'yyyy-MM'.",
      schema: {
        type: "string",
        example: "2025-01",
        // pattern: "^\\d{4}-\\d{2}$",
      },
    },
  ],
  description:
    "Returns all expenses for the given month, grouped by wallet and hydrated with tag and wallet details.",
  responses: {
    200: response("OK", schemaRef("GroupedExpensesResponse")),
    ...defaultResponses(),
  },
  tags: ["expenses"],
};

const getLatestExpenses = {
  operationId: "getLatestExpenses",
  summary: "Retrieve the most recent expenses",
  parameters: [
    {
      in: "query",
      name: "days",
      required: true,
      description:
        "Number of days to look back from today (integer between 15 and 45).",
      schema: {
        type: "integer",
        minimum: 15,
        maximum: 45,
        example: 30,
      },
    },
  ],
  description:
    "Returns the most recent expenses in descending order by date. The response is flat and does not include groupings or additional hydration.",
  responses: {
    200: response("OK", schemaRef("ListExpensesResponse")),
    ...defaultResponses(),
  },
  tags: ["expenses"],
};

export const expensePaths = {
  "/expenses": { post: postExpense, get: getExpenses },
  "/expenses/{id}": { put: putExpense, delete: deleteExpense },
  "/expenses/latest": { get: getLatestExpenses },
};
