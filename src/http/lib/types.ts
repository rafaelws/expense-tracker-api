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

export type HttpRequest = {
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: unknown;
};

export type HttpResponse = {
  body: unknown;
  status: number;
};

export const reply = (status = 200, body?: unknown): HttpResponse => ({
  status,
  body,
});

export type HttpHandler = (req: HttpRequest) => Promise<HttpResponse>;
