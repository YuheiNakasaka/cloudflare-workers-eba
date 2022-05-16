import type { Context, Next } from "hono";
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
      if (!namespace) return c.json({ message: "namespace is required" }, 400);
      if (!password) return c.json({ message: "password is required" }, 400);

      const record = await EBA.get(namespace);
      if (!record) return c.json({ message: "namespace is invalid" }, 400);

      const object: ApiDefinition = JSON.parse(record);
      if (object.password !== password)
        return c.json({ message: "authentication error" }, 401);
    } else {
      if (!namespace) return c.json({ message: "namespace is required" }, 400);

      const record = await EBA.get(namespace);
      if (!record) return c.json({ message: "not found" }, 404);
    }
    await next();
  };
};
