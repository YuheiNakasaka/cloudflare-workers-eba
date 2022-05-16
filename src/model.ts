import { StatusCode } from "hono/utils/http-status";

const PREFIX = "v1:";

export interface ApiDefinition {
  namespace: string;
  password: string;
  endpoints: Endpoint[];
}

export interface Endpoint {
  url: string;
  method: string;
  statusCode: StatusCode;
  responseHeader?: Record<string, any>;
  responseBody?: Record<string, any> | string;
}

export const getEndpoint = async (
  namespace: string,
  url: string,
  method: string
): Promise<Endpoint> => {
  const value = await EBA.get(namespace);
  if (!value) return new Promise((_, reject) => reject(null));

  const apiDefinition: ApiDefinition = await JSON.parse(value);
  const endpoints = Array.from(apiDefinition.endpoints);

  const pathname = new URL(url).pathname;
  const endpoint = searchEndpoint(endpoints, pathname, method);

  return endpoint;
};

export const createNamespace = async (
  password: string
): Promise<ApiDefinition | null> => {
  if (!password) return null;

  const namespace = generateUUID();
  const value = {
    namespace: namespace,
    password: password,
    endpoints: [],
  };
  await EBA.put(namespace, JSON.stringify(value));
  return value;
};

export const createEndpoint = async (
  namespace: string,
  inputBody: Endpoint
): Promise<boolean> => {
  const value = await EBA.get(namespace);
  const inputUrl = inputBody.url;
  const inputMethod = inputBody.method;
  if (!value) return new Promise((_, reject) => reject(false));

  const apiDefinition: ApiDefinition = JSON.parse(value);
  const endpoints = Array.from(apiDefinition.endpoints);
  if (!searchEndpoint(endpoints, inputUrl, inputMethod)) {
    const newEndpoints = endpoints.filter(
      (endpoint) => endpoint.url !== inputUrl
    );
    newEndpoints.push(inputBody);
    await EBA.put(
      namespace,
      JSON.stringify({
        namespace: namespace,
        password: apiDefinition.password,
        endpoints: newEndpoints,
      })
    );
    return true;
  } else {
    endpoints.push(inputBody);
    await EBA.put(
      namespace,
      JSON.stringify({
        namespace: namespace,
        password: apiDefinition.password,
        endpoints: endpoints,
      })
    );
    return true;
  }
};

const generateUUID = () => {
  return `${PREFIX}${crypto.randomUUID()}`;
};

const searchEndpoint = (
  endpoints: Endpoint[],
  pathname: string,
  method: string
) => {
  return endpoints.filter(
    (endpoint) => endpoint.url === pathname && endpoint.method === method
  )[0];
};
