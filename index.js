
'use strict';
/**
 * aux-ratings defines a sequelize model that represents a rating from an object to another object
 * in a specific context issued by a specific User.
 *
 * For example rating from Company A to Company B, given by User X, (presumably a member of company A) in the context
 * of Deal Y.
 *
 * In addition to soring the rating events the module defines a second sequelize model that caches the total
 * rating for the object that receives it. .
 */


const _ = require('lodash');

module.exports = function (sequelize, modelName, cacheModelName, RatingChannel, RatingCriteria, UserModel, FromModel, ToModel, ContextModel, settings) {
    var settings = _.extend({
        MAX_NOTE: 500,
    }, settings);
    var DataTypes = sequelize.Sequelize;

    var RatingEvent = sequelize.define(modelName, {
        channel:{
            type: DataTypes.ENUM({values: Object.keys(RatingChannel)}),
            allowNull: false,
        },
        rate: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        note: {
            type: DataTypes.STRING(settings.MAX_NOTE),
            allowNull: false,
        },
        criteria: {
            type: DataTypes.ENUM({values: Object.keys(RatingCriteria)}),
            allowNull: false,
        },
    }, {
        timestamps: true,
        classMethods: {
            add: function* (data){
                yield this.create(data);
                yield Rating.add(data.ToId, data.rate);
            }
        },
    });

    RatingEvent.belongsTo(UserModel, {as: 'User'});
    RatingEvent.belongsTo(ContextModel, {as: 'Context', foreignKey: { allowNull: false } });
    RatingEvent.belongsTo(FromModel, {as: 'From', foreignKey: { allowNull: false } });
    RatingEvent.belongsTo(ToModel, {as: 'To', foreignKey: { allowNull: false } }  );

    UserModel.hasMany(RatingEvent,  {foreignKey: 'UserId'});
    ContextModel.hasMany(RatingEvent, {foreignKey: 'ContextId' });
    ToModel.hasMany(RatingEvent, {as: 'ReceivedRating', foreignKey: 'ToId' });
    FromModel.hasMany(RatingEvent, {as: 'GivenRating', foreignKey: 'FromId' });



    var Rating = sequelize.define(cacheModelName, {
        total: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        }
    }, {
        timestamps: true,
        classMethods: {
            add: function*(ToId, amount){
                let rating = yield Rating.findOne({where: {ToId}});
                if(!rating){
                    rating = yield Rating.create({ToId});
                }
                rating.count++;
                rating.total+= amount;
                yield rating.save();
            },

            get: function*(ToId) {
                let rating = yield Rating.findOne({where: {ToId}});

                return rating === null ? {total: 0, count: 0} : rating;
            },

            getAverage: function*(ToId) {
                let currentRating = yield this.get(ToId);

                return currentRating.count === 0 ? 0 : (currentRating.total / currentRating.count).toFixed(2);
            },

            recalc: function(ToId){
                // TODO
            },

            recalcAll: function(){
                // TODO
            }
        }
    });


    Rating.belongsTo(ToModel, {as: 'To', foreignKey: { allowNull: false } } );
    ToModel.hasOne(Rating, {foreignKey: 'ToId' } );

    return {
        RatingEvent: RatingEvent,
        Rating: Rating
    }
};