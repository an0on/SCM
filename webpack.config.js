const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "url": require.resolve("url/"),
      "util": require.resolve("util/")
    }
  }
};