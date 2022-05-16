import { Hono } from "hono";
import { create, others, register } from "./controller";
import { auth } from "./middleware/auth";
import { jsonBodyParse } from "./middleware/json-body-parse";
import { xRequestType } from "./utils/header";

export const app = new Hono();

app.use("*", auth(), jsonBodyParse());

app.all("*", (c) => {
  const type = xRequestType(c);
  if (c.req.method == "POST" && type === "register") {
    return register(c);
  } else if (c.req.method == "POST" && type === "create") {
    return create(c);
  } else {
    return others(c);
  }
});

app.fire();
