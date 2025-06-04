import { schemaRef, uuidInParams } from "../schema";
import { body, defaultResponses, response } from "../schema/utils";

const postWallet = {
  operationId: "createWallet",
  summary: "Create a new wallet",
  requestBody: body(schemaRef("CreateWalletRequest")),
  responses: {
    201: response("Created", schemaRef("Wallet")),
    ...defaultResponses(),
  },
  tags: ["wallets"],
};

const putWallet = {
  operationId: "updateWallet",
  summary: "Updates an existing wallet",
  parameters: [uuidInParams()],
  requestBody: body(schemaRef("UpdateWalletRequest")),
  responses: {
    200: response("OK", schemaRef("Wallet")),
    404: response("Resource not found"),
    ...defaultResponses(),
  },
  tags: ["wallets"],
};

const deleteWallet = {
  operationId: "deleteWallet",
  summary: "Deletes an existing wallet",
  parameters: [uuidInParams()],
  responses: {
    204: response("No Content"),
    404: response("Resource not found"),
    ...defaultResponses(),
  },
  tags: ["wallets"],
};

export const walletPaths = {
  "/wallets": { post: postWallet },
  "/wallets/{id}": { put: putWallet, delete: deleteWallet },
};
