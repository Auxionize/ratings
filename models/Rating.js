/**
 * Created by yordan on 4/1/16.
 */
'use strict';

module.exports = function(sequelize, User, Initiator, Receiver) {
	let DataTypes = sequelize.Sequelize;
	let processEnumObject = require('../utils/enum').processEnumObject;
	let ChannelType = {buyer: '', seller: ''};
	let CriteriaType = {general: ''};

	processEnumObject(ChannelType);
	processEnumObject(CriteriaType);

	let Rating = sequelize.define(
		'Rating',
		{
			channel: {
				type: DataTypes.ENUM({values: Object.keys(ChannelType)}),
				allowNull: false
			},

			rate: {
				type: DataTypes.INTEGER,
				allowNull: false
			},

			note: {
				type: DataTypes.STRING(500),
				allowNull: false
			},

			criteria: {
				type: DataTypes.ENUM({values: Object.keys(CriteriaType)}),
				allowNull: false
			}
		},
		{
			timestamps: true,
			classMethods: {
				addModel: function* (data) {
					return yield this.create(data);
				}
			}
		}
	);

	/*
		Relations
	 */
	Rating.belongsTo(User, {as : 'User', foreignKey: {allowNull: false}});
	Rating.belongsTo(Initiator, {as: 'FromReference', foreignKey: {allowNull: false}});
	Rating.belongsTo(Receiver, {as: 'ToReference', foreignKey: {allowNull: false}});

	return Rating;
};