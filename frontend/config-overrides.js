const path = require('path');

module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "url": require.resolve("url/"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert/"),
      "crypto": require.resolve("crypto-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "util": require.resolve("util/"),
    };
    return config;
  }
};