/**
 * Created by yordan on 4/1/16.
 */
'use strict';
module.exports = function(sequelize, User, Reference) {
	let Rating = require('./models/Rating')(sequelize, User, Reference, Reference);
	// TODO Rating logic

	return {Rating: Rating};
};