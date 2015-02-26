
var fs = require('fs');
var path = require('path');
var type = Function.prototype.call.bind(Object.prototype.toString);


function makeArray(args) {
  var output = [];
  for (var n in args) {
    output.push(args[n]);
  }

  return output;
}


function isPlainObject(obj) {
  return type(obj) === '[object Object]';
}


function parseOptions(args) {
  var argsArray = makeArray(args);
  var opts = getOptions(argsArray);

  return {
    path: getPath(argsArray),
    env: opts.env || process.env.NODE_ENV || 'development'
  };
}


function getOptions(args) {
  var output = {};
  args.forEach(function (a) {
    if (isPlainObject(a)) {
      output = a;
      return;
    }
  });

  return output;
}


function getPath(args) {
  var segments = [];
  args.forEach(function (a) {
    if (typeof a === 'string') {
      segments.push(a);
    }
  });

  return path.join.apply(path, segments);
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
        envConfig[innerEnvKey] = innerValue;
      });
    } else {
      envConfig[envKey] = value;
    }
  });

  return envConfig;
}

function applyConfigToEnv(config) {
  var appliedConfig = {};
  Object.keys(config).forEach(function (key) {
    var value = config[key];
    var envValue = process.env[key];
    process.env[key] = appliedConfig[key] = envValue || value;
  });

  return appliedConfig;
}


function load() {
  var options = parseOptions(arguments);
  var config = getConfig(options.path, options.env);

  if (!config) {
    throw 'enfig: Could not find configuration for ' + options.env + ' at ' + options.path;
  }

  var envConfig = flattenForEnv(config);
  var appliedConfig = applyConfigToEnv(envConfig);

  return {config: config, env: envConfig, applied: appliedConfig};
}

load.load = load;
module.exports = load;
