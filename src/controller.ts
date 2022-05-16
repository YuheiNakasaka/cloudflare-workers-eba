import type { Context } from "hono";
import { createEndpoint, createNamespace, getEndpoint } from "./model";
import { CreateResponse, RegisterResponse } from "./types/response";
import { contentType, xNamespace } from "./utils/header";

export const register = async (c: Context) => {
  const body = c.req.jsonParsedBody;
  if (!body) return c.json({ message: "body is invalid" }, 400);

  const password = body.password;
  const result = await createNamespace(password);
  if (!result) return c.json({ message: "password is required" }, 400);

  const response: RegisterResponse = {
    namespace: result.namespace,
    password: result.password,
  };
  return c.json(response);
};

export const create = async (c: Context) => {
  const body = c.req.jsonParsedBody;
  const namespace = xNamespace(c);
  const result = await createEndpoint(namespace, body);
  const response: CreateResponse = { message: result ? "ok" : "ng" };
  return c.json(response);
};

export const others = async (c: Context) => {
  const namespace = xNamespace(c);
  const result = await getEndpoint(namespace, c.req.url, c.req.method);
  if (!result) return c.json({ message: "not found" }, 404);

  if (result.statusCode) {
    c.status(result.statusCode);
  }

  if (result.responseHeader) {
    for (const key in result.responseHeader) {
      c.header(key, result.responseHeader[key]);
    }
  }

  if (result.responseBody) {
    const isJson = contentType(result.responseHeader) === "application/json";
    return c.body(
      isJson ? JSON.stringify(result.responseBody) : `${result.responseBody}`
    );
  } else {
    return c.body("");
  }
};
