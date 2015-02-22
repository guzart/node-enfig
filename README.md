# enfig *(for Node.js)*

Create environment variables from a configuration file.

* Enfig assumes that your configuration file is grouped by environment.
* Enfig will generate an environment key from your configuration file based on the following rules:
  * Convert `pascalCase` keys to `snake_case`
  * Prefix the `snake_case` key for plain objects witht he parent key. (Hashes)
  * Upper case the environment keys

## Index

1. [Example](#example)
  * [Warning](#warning)
1. [API](#api)
  * [load(path, [options])](#enfigloadpath-options)

## Example

*terminal*
```bash
$ DB_HOST=myhost.example.com node index.js
```

*config.json*
```json
{
  "development" {
    "port": 3000,
    "logPath": "logs/app.log",
    "db": {
      "username": "enfig",
      "password": "secret",
      "host": "localhost"
    }
  }
}
```

*index.js*
```javascript
var enfig = require('enfig');
enfig.load('config.json');

console.log(process.env.PORT); // 3000
console.log(process.env.LOG_PATH); // logs/app.log
console.log(process.env.DB_USERNAME); // enfig
console.log(process.env.DB_PASSWORD); // secret
console.log(process.env.DB_HOST); // myhost.example.com
```

### Warning

Because enfig prefixes the keys of a hash with the parent key, it's possible that keys will be overriden. And the priority is not guaranteed, e.g.

```json
{
  "development": {
    "dbUsername": "myUser",
    "db": {
      "username": "otherUser"
    }
  }
}
```

## API

### enfig.load(path, [options])

#### path

Type: `String`  
_required_

Path to the configuration file.

#### options.env

Type: `String`  
_optional_

The environment to load.
