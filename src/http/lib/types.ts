import { Request } from "express";

export interface HandlerRequest<Body = unknown, Query = Record<string, unknown>>
  extends Request<Record<string, string>, unknown, Body, Query> {}

// export type HandlerResponse<Res = unknown> = Response<Res>;
