# eba

# USAGE

## POST /

Create an unique namespace.

### Request Header

| Key            | Description             | value    |
| :------------- | :---------------------- | :------- |
| X-REQUEST-TYPE | [required] request type | register |

### Request Body

| Key      | Description         | value |
| :------- | :------------------ | :---- |
| password | [required] password |       |

```sh
$ curl -X POST localhost:8787 -H 'X-REQUEST-TYPE:register' -d '{"password": "xxxxxxxx"}'
{"namespace": "your-unique-namespace", "password": "xxxxxxxx"}
```

## POST /

Create an endpoint.

### Request Header

| Key            | Description                    | value  |
| :------------- | :----------------------------- | :----- |
| X-NAMESPACE    | [required] generated namaspace |        |
| X-PASSWORD     | [required] registered password |        |
| X-REQUEST-TYPE | [required] request type        | create |

### Request Body

| Key            | Description                | value                                      |
| :------------- | :------------------------- | :----------------------------------------- |
| method         | [required] request method  | GET/POST/PUT/DELETE/OPTIONS/HEAD           |
| statusCode     | [required] status code     | Valid status code                          |
| responseHeader | [optional] response header | Tested content-type is only text/html/json |
| responseBody   | [optional] response body   |                                            |

```sh
$ curl -X POST localhost:8787 \
  -H 'X-NAMESPACE:your-unique-namespace' \
  -H 'X-PASSWORD:xxxxxxxx' \
  -H 'X-REQUEST-TYPE:create' \
  -d '{"url": "/foo/bar/baz", "method": "GET", "statusCode": 200, "responseHeader": {"content-type": "application/json", "cache-control": "no-cache"}, "responseBody": {"message": "Hello World", "feeling": "Good"}}'
{"message": "ok"}
```

# How to call created endpoints

```sh
$ curl -D -X GET -H 'X-NAMESPACE:your-unique-namespace' - localhost:8787/foo/bar/baz
HTTP/2 200
content-type: application/json
cache-control: no-cache
{"message": "Hello World", "feeling": "Good"}
```
