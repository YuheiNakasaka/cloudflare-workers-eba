import { Context } from "hono";

export const xNamespace = (c: Context) => {
  return c.req.header("X-NAMESPACE");
};

export const xPassword = (c: Context) => {
  return c.req.header("X-PASSWORD");
};

export const xRequestType = (c: Context) => {
  return c.req.header("X-REQUEST-TYPE");
};

export const contentType = (headers?: Record<string, any>) => {
  if (!headers) return "";
  return headers["Content-Type"] || headers["content-type"];
};
