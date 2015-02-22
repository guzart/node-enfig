
var fs = require('fs');
var type = Function.prototype.call.bind(Object.prototype.toString);

function getEnv(options) {
  return (options || {}).env || process.env.NODE_ENV || 'development';
}

function isPlainObject(obj) {
  return type(obj) === '[object Object]';
}

function getConfig(path, env, callback) {
  var stat = fs.statSync(path);
  var exists = stat.isFile();
  if (!exists) {
    return null;
  }

  var configFile = require(path);
  return configFile[env];
}

function upcase(word) {
  if (!word) { return word; }
  return word.toUpperCase();
}

function downcase(word) {
  if (!word) { return word; }
  return word.toLowerCase();
}

function pascalCaseToSnakeCase(word) {
  var matches = word.match(/^[a-z]+|[A-Z][a-z]+/g);
  return downcase(matches.join('_'));
}

function hyphenCaseToSnakeCase(word) {
  var matches = word.split(/\-+/g);
  return downcase(matches.join('_'));
}

function snakeCase(word) {
  return hyphenCaseToSnakeCase(pascalCaseToSnakeCase(word));
}

function flattenForEnv(config) {
  var envConfig = {};

  Object.keys(config).forEach(function (key) {
    var value = config[key];
    var envKey = upcase(snakeCase(key));

    if (isPlainObject(value)) {
      var innerEnvConfig = flattenForEnv(value);
      Object.keys(innerEnvConfig).forEach(function (innerKey) {
        var innerValue = innerEnvConfig[innerKey];
        var innerEnvKey = envKey + '_' + upcase(innerKey);
        var innerEnvValue = process.env[innerEnvKey];
        envConfig[innerEnvKey] = innerEnvValue || innerValue;
      });
    } else {
      var envValue = process.env[envKey];
      envConfig[envKey] = envValue || value;
    }
  });

  return envConfig;
}

module.exports = {
  load: function (path, options) {
    var env = getEnv(options);
    var config = getConfig(path, env);
    if (!config) {
      throw 'enfig: Could not find configuration for ' + env + ' at ' + path;
    }

    var envConfig = flattenForEnv(config);
    return {config: config, env: envConfig};
  }
};
