import type { Context, Next } from "hono";

export const jsonBodyParse = () => {
  return async (c: Context, next: Next) => {
    try {
      c.req.jsonParsedBody = await c.req.json();
    } catch (e) {
      console.log(`Json parsing error: ${e}`);
    }
    await next();
  };
};
