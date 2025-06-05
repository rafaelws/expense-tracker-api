import { schemaRef, uuidInParams } from "../schema";
import { body, defaultResponses, response } from "../schema/schema-utils.oapi";

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

const getWalletsResponses = { ...defaultResponses() };
delete getWalletsResponses[400];
getWalletsResponses[200] = response("OK", schemaRef("WalletList"));

const getWallets = {
  operationId: "getWallets",
  summary: "Retrieve wallets",
  responses: getWalletsResponses,
  tags: ["wallets"],
} as const;

export const walletPaths = {
  "/wallets": { post: postWallet, get: getWallets },
  "/wallets/{id}": { put: putWallet, delete: deleteWallet },
};
