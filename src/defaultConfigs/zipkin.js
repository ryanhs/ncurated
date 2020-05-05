module.exports = {
  full: {
    ZIPKIN_ENABLE: true,
    ZIPKIN_DRIVER: 'http',
    ZIPKIN_HTTP_ENDPOINT: 'http://zipkin-service:9411/api/v2/spans',
  },
  development: {
    ZIPKIN_ENABLE: false,
    ZIPKIN_DRIVER: 'none',
  },
  production: {
    ZIPKIN_ENABLE: false,
    ZIPKIN_DRIVER: 'none', // mostly not needed to use zipkin, is it?
  },
};
