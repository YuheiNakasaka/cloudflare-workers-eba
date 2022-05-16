import { StatusCode } from "hono/utils/http-status";
import { app } from "./index";
import { Endpoint } from "./model";
import {
  CreateResponse,
  ErrorResponse,
  RegisterResponse,
} from "./types/response";

const statusCode = (code: number): StatusCode => {
  return code as StatusCode;
};

const getNamespace = async () => {
  const res = await app.request("http://localhost/", {
    method: "POST",
    headers: {
      "X-REQUEST-TYPE": "register",
    },
    body: JSON.stringify({
      password: "password",
    }),
  });
  const body: RegisterResponse = await res.json();
  return body;
};

const createEndpoint = async (requestBody: Endpoint) => {
  const { namespace, password } = await getNamespace();
  await app.request("http://localhost/", {
    method: "POST",
    headers: {
      "X-REQUEST-TYPE": "create",
      "X-NAMESPACE": namespace,
      "X-PASSWORD": password,
    },
    body: JSON.stringify(requestBody),
  });
  return namespace;
};

describe("Get a namespace", () => {
  describe("password is not defined", () => {
    it("should return 400", async () => {
      const res = await app.request("http://localhost/", {
        method: "POST",
        headers: {
          "X-REQUEST-TYPE": "register",
        },
      });
      const resBody: ErrorResponse = await res.json();
      expect(res.status).toBe(400);
      expect(resBody.message).toBe("body is invalid");
    });
  });

  describe("password is empty", () => {
    it("should return 400", async () => {
      const res = await app.request("http://localhost/", {
        method: "POST",
        headers: {
          "X-REQUEST-TYPE": "register",
        },
        body: JSON.stringify({ password: "" }),
      });
      const resBody: ErrorResponse = await res.json();
      expect(res.status).toBe(400);
      expect(resBody.message).toBe("password is required");
    });
  });

  describe("When the request is successful", () => {
    it("POST /", async () => {
      const res = await app.request("http://localhost/", {
        method: "POST",
        headers: {
          "X-REQUEST-TYPE": "register",
        },
        body: JSON.stringify({
          password: "password",
        }),
      });
      const body: RegisterResponse = await res.json();
      expect(res.status).toBe(200);
      expect(body.namespace).toBeTruthy();
      expect(body.password).toEqual("password");
    });
  });
});

describe("Create an endpoint", () => {
  describe("namespace is empty", () => {
    it("should return 404", async () => {
      const res = await app.request("http://localhost/", {
        method: "POST",
        headers: {
          "X-REQUEST-TYPE": "create",
        },
      });
      const resBody: ErrorResponse = await res.json();
      expect(res.status).toBe(400);
      expect(resBody.message).toBe("namespace is required");
    });
  });

  describe("password is empty", () => {
    it("should return 400", async () => {
      const res = await app.request("http://localhost/", {
        method: "POST",
        headers: {
          "X-REQUEST-TYPE": "create",
          "X-NAMESPACE": "valid-namespace",
        },
      });
      const resBody: ErrorResponse = await res.json();
      expect(res.status).toBe(400);
      expect(resBody.message).toBe("password is required");
    });
  });

  describe("namespace is not registered", () => {
    it("should return 400", async () => {
      const res = await app.request("http://localhost/", {
        method: "POST",
        headers: {
          "X-REQUEST-TYPE": "create",
          "X-NAMESPACE": "valid-namespace",
          "X-PASSWORD": "password",
        },
      });
      const resBody: ErrorResponse = await res.json();
      expect(res.status).toBe(400);
      expect(resBody.message).toBe("namespace is invalid");
    });
  });

  describe("namespace and password are not valid", () => {
    it("should return 401", async () => {
      const { namespace } = await getNamespace();
      const res = await app.request("http://localhost/", {
        method: "POST",
        headers: {
          "X-REQUEST-TYPE": "create",
          "X-NAMESPACE": namespace,
          "X-PASSWORD": "invalid-password",
        },
      });
      const resBody: ErrorResponse = await res.json();
      expect(res.status).toBe(401);
      expect(resBody.message).toBe("authentication error");
    });
  });

  describe("When the request is successful", () => {
    it("POST /", async () => {
      const { namespace, password } = await getNamespace();
      const requestBody = {
        url: "/foo/bar/baz",
        method: "GET",
        responseHeader: {
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
        responseBody: { message: "Hello World", feeling: "Good" },
      };
      const res = await app.request("http://localhost/", {
        method: "POST",
        headers: {
          "X-REQUEST-TYPE": "create",
          "X-NAMESPACE": namespace,
          "X-PASSWORD": password,
        },
        body: JSON.stringify(requestBody),
      });
      const body: CreateResponse = await res.json();
      expect(res.status).toBe(200);
      expect(body.message).toEqual("ok");
    });
  });

  describe("Request to the defined endpoint", () => {
    describe("namespace is empty", () => {
      it("GET /", async () => {
        const res = await app.request(`http://localhost/`, {
          method: "GET",
        });
        const body: ErrorResponse = await res.json();
        expect(res.status).toBe(400);
        expect(body.message).toBe("namespace is required");
      });
    });

    describe("namespace is not existed", () => {
      it("GET /", async () => {
        const res = await app.request(`http://localhost/`, {
          method: "GET",
          headers: {
            "X-NAMESPACE": "not-existed-namespace",
          },
        });
        const body: ErrorResponse = await res.json();
        expect(res.status).toBe(404);
        expect(body.message).toBe("not found");
      });
    });

    describe("GET", () => {
      describe("as json response", () => {
        it("GET /foo/bar/baz", async () => {
          const requestBody = {
            url: "/foo/bar/baz",
            method: "GET",
            statusCode: statusCode(200),
            responseHeader: {
              "content-type": "application/json",
              "cache-control": "no-cache",
            },
            responseBody: { message: "Hello World", feeling: "Good" },
          };
          const namespace = await createEndpoint(requestBody);

          const res = await app.request(`http://localhost${requestBody.url}`, {
            method: "GET",
            headers: {
              "X-NAMESPACE": namespace,
            },
          });
          const body: Record<string, any> = await res.json();
          expect(res.status).toBe(200);
          expect(res.headers.get("content-type")).toBe(
            requestBody.responseHeader["content-type"]
          );
          expect(res.headers.get("cache-control")).toBe(
            requestBody.responseHeader["cache-control"]
          );
          expect(body.message).toEqual(requestBody.responseBody.message);
          expect(body.feeling).toEqual(requestBody.responseBody.feeling);
        });
      });

      describe("as html response", () => {
        it("GET /foo/bar/baz", async () => {
          const requestBody = {
            url: "/foo/bar/baz",
            method: "GET",
            statusCode: statusCode(200),
            responseHeader: {
              "content-type": "text/html; charset=UTF-8",
            },
            responseBody: "<html><body><h1>Hello World</h1></body></html>",
          };
          const namespace = await createEndpoint(requestBody);

          const res = await app.request(`http://localhost${requestBody.url}`, {
            method: "GET",
            headers: {
              "X-NAMESPACE": namespace,
            },
          });
          const body: string = await res.text();
          expect(res.status).toBe(200);
          expect(res.headers.get("content-type")).toBe(
            requestBody.responseHeader["content-type"]
          );
          expect(body).toEqual(requestBody.responseBody);
        });
      });

      describe("as text response", () => {
        it("GET /foo/bar/baz", async () => {
          const requestBody = {
            url: "/foo/bar/baz",
            method: "GET",
            statusCode: statusCode(200),
            responseHeader: {
              "content-type": "text/plain",
            },
            responseBody: "Hello World",
          };
          const namespace = await createEndpoint(requestBody);

          const res = await app.request(`http://localhost${requestBody.url}`, {
            method: "GET",
            headers: {
              "X-NAMESPACE": namespace,
            },
          });
          const body: string = await res.text();
          expect(res.status).toBe(200);
          expect(res.headers.get("content-type")).toBe(
            requestBody.responseHeader["content-type"]
          );
          expect(body).toEqual(requestBody.responseBody);
        });
      });
    });

    describe("POST", () => {
      describe("as json response", () => {
        it("POST /foo/bar/baz", async () => {
          const requestBody = {
            url: "/foo/bar/baz",
            method: "POST",
            statusCode: statusCode(201),
            responseHeader: {
              "content-type": "application/json",
              "cache-control": "no-cache",
            },
            responseBody: { message: "Hello World", feeling: "Good" },
          };
          const namespace = await createEndpoint(requestBody);

          const res = await app.request(`http://localhost${requestBody.url}`, {
            method: "POST",
            headers: {
              "X-NAMESPACE": namespace,
            },
          });
          const body: Record<string, any> = await res.json();
          expect(res.status).toBe(201);
          expect(res.headers.get("content-type")).toBe(
            requestBody.responseHeader["content-type"]
          );
          expect(res.headers.get("cache-control")).toBe(
            requestBody.responseHeader["cache-control"]
          );
          expect(body.message).toEqual(requestBody.responseBody.message);
          expect(body.feeling).toEqual(requestBody.responseBody.feeling);
        });
      });
    });

    describe("PUT", () => {
      describe("as json response", () => {
        it("PUT /foo/bar/baz", async () => {
          const requestBody = {
            url: "/foo/bar/baz",
            method: "PUT",
            statusCode: statusCode(201),
            responseHeader: {
              "content-type": "application/json",
              "cache-control": "no-cache",
            },
            responseBody: { message: "Hello World", feeling: "Good" },
          };
          const namespace = await createEndpoint(requestBody);

          const res = await app.request(`http://localhost${requestBody.url}`, {
            method: "PUT",
            headers: {
              "X-NAMESPACE": namespace,
            },
          });
          const body: Record<string, any> = await res.json();
          expect(res.status).toBe(201);
          expect(res.headers.get("content-type")).toBe(
            requestBody.responseHeader["content-type"]
          );
          expect(res.headers.get("cache-control")).toBe(
            requestBody.responseHeader["cache-control"]
          );
          expect(body.message).toEqual(requestBody.responseBody.message);
          expect(body.feeling).toEqual(requestBody.responseBody.feeling);
        });
      });
    });

    describe("DELETE", () => {
      describe("as json response", () => {
        it("DELETE /foo/bar/baz", async () => {
          const requestBody = {
            url: "/foo/bar/baz",
            method: "DELETE",
            statusCode: statusCode(200),
            responseHeader: {
              "content-type": "application/json",
              "cache-control": "no-cache",
            },
            responseBody: { message: "Hello World", feeling: "Good" },
          };
          const namespace = await createEndpoint(requestBody);

          const res = await app.request(`http://localhost${requestBody.url}`, {
            method: "DELETE",
            headers: {
              "X-NAMESPACE": namespace,
            },
          });
          const body: Record<string, any> = await res.json();
          expect(res.status).toBe(200);
          expect(res.headers.get("content-type")).toBe(
            requestBody.responseHeader["content-type"]
          );
          expect(res.headers.get("cache-control")).toBe(
            requestBody.responseHeader["cache-control"]
          );
          expect(body.message).toEqual(requestBody.responseBody.message);
          expect(body.feeling).toEqual(requestBody.responseBody.feeling);
        });
      });
    });
  });
});
