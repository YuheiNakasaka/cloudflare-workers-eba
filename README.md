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
$ curl -X POST 'https://eba.razokulover.workers.dev/' -H 'X-REQUEST-TYPE:register' -d '{"password": "xxxxxxxx"}'
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
$ curl -X POST 'https://eba.razokulover.workers.dev/' \
  -H 'X-NAMESPACE:your-unique-namespace' \
  -H 'X-PASSWORD:xxxxxxxx' \
  -H 'X-REQUEST-TYPE:create' \
  -d '{"url": "/ebata-kisaki", "method": "GET", "statusCode": 200, "responseHeader": {"content-type": "application/json", "cache-control": "no-cache"}, "responseBody": {"blog": "https://ameblo.jp/juicejuice-official/theme-10115236106.html"}}'
{"message": "ok"}
```

# How to call the created endpoint

```sh
$ curl -X GET -H 'X-NAMESPACE:your-unique-namespace' -D - 'https://eba.razokulover.workers.dev/ebata-kisaki'
HTTP/2 200
content-type: application/json
cache-control: no-cache
{"blog": "https://ameblo.jp/juicejuice-official/theme-10115236106.html"}
```
