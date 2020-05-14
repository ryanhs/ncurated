# NCurated

[![Build Status](https://travis-ci.com/ryanhs/ncurated.svg?branch=master)](https://travis-ci.com/ryanhs/ncurated)
![node-current](https://img.shields.io/node/v/ncurated)

This is not a Framework per se. This more like just a curated list of nodejs packages.

Example, in building microservices usually we face the situation that we know we need stream feature.
Either its kafka, redis, or, nats, or something else. Thats we start to have a migraine \-\_\-.

This curated list i made, is try to put abstraction on top of these libraries.

## Installation

Actually for us personally, we use this curated as "sdk". As it can be used along with chosen framework.

`yarn add sdk@npm:ncurated`

then you can use this so called "sdk".

```javascript
const sdk = require('sdk');

```


### Configurations

Most of commont configuration may be added via environment variables. (with prefix `SDK_`).
This way, the app can be changed without touching the code.

For example, you develop it in redis stream, zipkin memory, cache memory.
But in the server you use kafka stream, zipkin http, and cache with redis. Just use `SDK_` prefix env.


## Integration

This curated list is not really binding into a Framework.
Please feel free to use any framework to use. \*as long as its compatible :-)


## Utilities

### Cache

- cache-manager
- cache-manager-redis-store

Initialized and encapsulated with bluebird. thank me later.

This way we can use something like `sdk.cache.setAsync("a", 1)`.

#### namespace

In real world scenario a cache may/should have a namespace.
For example, a cache for collection/table Post, and User.
You can cache each user, delete by userId, but if you make bulk update / delete, just reset the cache for namespace User (Post namespace not affected)

```javascript
// default
await cache.set('a', 1);
await expect(cache.get('a')).resolves.toBe(1);

// namespace posts
await cache.namespace('posts').set('a', 11);
await expect(cache.namespace('posts').get('a')).resolves.toBe(11);
await expect(cache.get('a')).resolves.toBe(1); // still 1 for default

// namespace users
await cache.namespace('users').set('a', 222);
await expect(cache.namespace('users').get('a')).resolves.toBe(222);
await expect(cache.namespace('posts').get('a')).resolves.toBe(11); // still 11 for posts
await expect(cache.get('a')).resolves.toBe(1); // still 1 for default

// reset posts
await cache.namespace('posts').reset();
await expect(cache.namespace('users').get('a')).resolves.toBe(222);
await expect(cache.namespace('posts').get('a')).resolves.toBe(undefined); // no more for posts
await expect(cache.get('a')).resolves.toBe(1); // still 1 for default
});
```

#### Example

```javascript

await sdk.cache.setAsync("a", 1);

const a = sdk.cache.getAsync("a");

const b = await sdk.cache.wrap('b', () => Promise.resolve('foo'));
```

### Log

After some extensive reading for logger library, we have come a cross decision to use bunyan here.
This bunyan include options for:

- bunyan-debug-stream
- bunyan-slack
- bunyan-teams
- bunyan-cloudwatch


#### Example

```javascript

await sdk.log.info("you can refer to bunyan documentation for this log object :-p");
```

#### Bunyan.RingBuffer

Bunyan ringbuffer is enabled by default. So we can use to track logs, even in unit test mode.

try to get ringBuffer object? this how we do that: `sdk.log.ringBuffer`.


## Metrics

### Zipkin

For easier tracer, we can use zipkin as tracer exporter.
Just enable it with config `ZIPKIN_ENABLE` or via env `SDK_ZIPKIN_ENABLE` set to `true`.

Env Variables example:

```
SDK_ZIPKIN_ENABLE: true,
SDK_ZIPKIN_DRIVER: 'http',
SDK_ZIPKIN_HTTP_ENDPOINT: 'http://zipkin-service:9411/api/v2/spans',
```

## Stream


## Graphql

A binding for ApolloClient graphql.

> if you enable zipkin, then its zipkin wrapped also

**Example**:

```javascript
await sdk.enable_graphql({
  uri: 'https://some-graphql-server.com/graphql',
  remoteServiceName: 'fakeql',
});

const query = `
  query {
    user (id: 1) {
      id
      name
      phone
    }
  }
`;

const response = await sdk.graphql.query({ query, throwError: true, withCache: false });
```

## Authorization


## Mutex

*- to do -*

## Awesome Libraries

\*bluebird, rxjs, node-machine, moment. No more explanation for these awesome libraries.

## Requirements

Although some of the packages, it can be running at as log as node 8.11.

Its recommended to run it in current supported LTS version. (Dubnium perhaps?).

## Changelog

Actually this curated list used only for private use before, therefore we have some changelog related to decision

**v1.12.0 (old name)**

Removed bunyan-elasticsearch, as we use cloudwatch more and more. But feel free to raise a request to add it once again.
