import { Context, Next } from "hono";
import { ApiDefinition } from "../../model";
import { xNamespace, xPassword, xRequestType } from "../../utils/header";

export const auth = () => {
  return async (c: Context, next: Next) => {
    const namespace = xNamespace(c);
    const type = xRequestType(c);
    const password = xPassword(c);

    if (type === "register") {
      await next();
      return;
    } else if (type === "create") {
      if (!namespace) {
        c.res = new Response('{"message":"namespace is required"}', {
          status: 400,
        });
        return;
      }
      if (!password) {
        c.res = new Response('{"message":"password is required"}', {
          status: 400,
        });
        return;
      }

      const record = await EBA.get(namespace);
      if (!record) {
        c.res = new Response('{"message":"namespace is invalid"}', {
          status: 400,
        });
        return;
      }

      const object: ApiDefinition = JSON.parse(record);
      if (object.password !== password) {
        c.res = new Response('{"message":"authentication error"}', {
          status: 401,
        });
        return;
      }
    } else {
      if (!namespace) {
        c.res = new Response('{"message":"namespace is required"}', {
          status: 400,
        });
        return;
      }

      const record = await EBA.get(namespace);

      if (!record) {
        c.res = new Response('{"message":"not found"}', {
          status: 404,
        });
        return;
      }
    }
    await next();
  };
};
