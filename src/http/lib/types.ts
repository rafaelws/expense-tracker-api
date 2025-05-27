import { Request, Response } from "express";

export type HandlerRequest<
  Body = unknown,
  Query = Record<string, unknown>,
> = Request<Record<string, string>, unknown, Body, Query>;

export type HandlerResponse<Res = unknown> = Response<Res> & {
  locals: {
    userId: string;
  };
};
