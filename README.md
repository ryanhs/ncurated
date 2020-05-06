# NCurated

[![Build Status](https://travis-ci.com/ryanhs/node-curated.svg?branch=master)](https://travis-ci.com/ryanhs/node-curated)

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

## Integration

This curated list is not really binding into a Framework.
Please feel free to use any framework to use. \*as long as its compatible :-)

## Utilities

### Cache

- cache-manager
- cache-manager-redis-store

Initialized and encapsulated with bluebird. `Promise.promisifyAll(cacheManager)`, thank me later.

This way we can use something like `sdk.cache.setAsync("a", 1)`.

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


### Metrics


## Stream


## Graphql


## Authorization


## Mutex


## Awesome Libraries

\*bluebird, rxjs, node-machine, moment. No more explanation for these awesome libraries.

## Requirements

Although some of the packages, it can be running at as log as node 8.11.

Its recommended to run it in current supported LTS version. (Dubnium perhaps?).

## Changelog

Actually this curated list used only for private use before, therefore we have some changelog related to decision

**v1.12.0 (old name)**

Removed bunyan-elasticsearch, as we use cloudwatch more and more. But feel free to raise a request to add it once again.
