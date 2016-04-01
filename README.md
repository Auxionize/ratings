# Rating - Generic Ratings for Sequalize

## Simple to use

Ratings is designed to be simplest way to integrate and use rating system.

```
var object = require('index')(sequelize, User, Reference);
```
 
``` 
/**
 * Add new model
 * @param {Object} data
 * @return {Object}
 */
 
var newModel = yield object.Rating.addModel(data);
```