import type { FastifyPluginAsync } from "fastify";
import { ExpenseRepository } from "@/features/expenses/expense-repository";
import type {
  CreateExpenseDTO,
  UpdateExpenseDTO,
} from "@/features/expenses/expense-schema";
import { ExpenseService } from "@/features/expenses/expense-service";
import { ValidationError } from "@/lib/errors";
import { anyOfKeys } from "@/lib/util";
import { setAuthHook } from "../middlewares/auth-hook";
import { response, responses } from "../openapi/schema-helper";
import { type IdParam, schemaRegistry } from "../openapi/schema-registry";

const expenseService = new ExpenseService(new ExpenseRepository());

const expensesRouter: FastifyPluginAsync = async (router) => {
  setAuthHook(router);

  router.get<{ Querystring: { month: string } }>(
    "/",
    {
      schema: {
        operationId: "getExpenses",
        summary: "Retrieve expenses grouped by wallet for a given month",
        description:
          "Returns all expenses for the given month, grouped by wallet and hydrated with tag and wallet details.",
        tags: ["expenses"],
        querystring: {
          type: "object",
          required: ["month"],
          additionalProperties: false,
          properties: {
            month: {
              type: "string",
              examples: ["2025-01", "2025-09"],
              minLength: 7,
              maxLength: 7,
              pattern: "^\\d{4}-\\d{2}$",
              // pattern: "^[0-9]{4}-(0[1-9]|1[0-2])$",
            },
          },
          // in: "query",
          // name: "month",
          // required: true,
          // description: "Reference month in the format 'yyyy-MM'.",
          // schema: {
          //   type: "string",
          //   example: "2025-01",
          //   minLength: 7,
          //   maxLength: 7,
          //   pattern: "^\\d{4}-\\d{2}$",
          //   // pattern: "^[0-9]{4}-(0[1-9]|1[0-2])$",
          // },
        },
        response: {
          200: response(200, schemaRegistry.expenses.manyGrouped.$ref),
          ...responses(400, 401, 500),
        },
      },
    },
    async (req, reply) => {
      const result = await expenseService.listExpenses(
        req.userId!,
        req.query.month,
      );
      return reply.code(200).send(result);
    },
  );

  router.post<{ Body: CreateExpenseDTO }>(
    "/",
    {
      schema: {
        operationId: "createExpense",
        summary: "Create a new expense",
        tags: ["expenses"],
        body: { $ref: schemaRegistry.expenses.create.id },
        response: {
          200: response(200, schemaRegistry.expenses.one.$ref),
          ...responses(400, 401, 500),
        },
      },
    },
    async (req, reply) => {
      const result = await expenseService.createExpense(req.userId!, req.body);
      return reply.code(201).send(result);
    },
  );

  router.put<{ Params: IdParam; Body: UpdateExpenseDTO }>(
    "/:id",
    {
      schema: {
        operationId: "updateExpense",
        summary: "Updates an existing expense",
        tags: ["expenses"],
        params: { $ref: schemaRegistry.commons.idParam.$ref },
        body: { $ref: schemaRegistry.expenses.update.$ref },
        response: {
          200: response(200, schemaRegistry.expenses.one.$ref),
          ...responses(400, 401, 404, 500),
        },
      },
    },
    async (req, reply) => {
      if (
        !anyOfKeys(req.body, [
          "title",
          "description",
          "amount",
          "occurredAt",
          "status",
          "walletId",
          "tagIds",
        ])
      ) {
        throw new ValidationError("At least one field should be present");
      }
      const result = await expenseService.updateExpense(
        req.params.id,
        req.userId!,
        req.body,
      );
      return reply.code(200).send(result);
    },
  );

  router.delete<{ Params: IdParam }>(
    "/:id",
    {
      schema: {
        operationId: "deleteExpense",
        summary: "Deletes an existing expense",
        tags: ["expenses"],
        params: { $ref: schemaRegistry.commons.idParam.$ref },
        response: {
          ...responses(204, 401, 404, 500),
        },
      },
    },
    async (req, reply) => {
      await expenseService.deleteExpense(req.params.id, req.userId!);
      return reply.code(204).send();
    },
  );

  router.get<{ Querystring: { days: number } }>(
    "/latest",
    {
      schema: {
        operationId: "getLatestExpenses",
        summary: "Retrieve the most recent expenses",
        description:
          "Returns the most recent expenses in descending order by date. The response is flat and does not include groupings or additional hydration.",
        tags: ["expenses"],
        querystring: {
          type: "object",
          required: ["days"],
          additionalProperties: false,
          properties: {
            days: {
              description:
                "Number of days to look back from today (integer between 15 and 45).",
              type: "integer",
              minimum: 15,
              maximum: 45,
              examples: [15, 30, 33, 16, 45],
            },
          },
        },
        response: {
          200: response(200, schemaRegistry.expenses.many.$ref),
          ...responses(400, 401, 500),
        },
      },
    },
    async (req, reply) => {
      const result = await expenseService.listLatestExpenses(
        req.userId!,
        req.query.days,
      );
      return reply.code(200).send(result);
    },
  );
};

export default expensesRouter;

export const autoPrefix = "/expenses";
