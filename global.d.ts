declare const EBA: KVNamespace;

declare interface Request {
  parsedHeader: Record<string, string>;
  jsonParsedBody: any;
}
