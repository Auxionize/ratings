'use strict';

var Sequelize = require('sequelize');
var co = require('co');
var _ = require('lodash');

var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

//this one allows using generator functions in tests, setup and teardown methods. See co library
require('co-mocha');


var sequelize = new Sequelize('ratings', 'postgres', '24262426', {
    host: 'localhost',
    dialect: 'postgres',
});

var modelsArray = [];
var models = [];
var addModel = function(name, attribs, options){
    var model = sequelize.define(name, attribs, options);
    modelsArray.push(model);
    models[model.modelName] = model;
    return model;
};


// Test Models
var User    = addModel('User',      {name:{type: Sequelize.STRING}});
var Company = addModel('Company',   {name:{type: Sequelize.STRING}});
var Auction = addModel('Auction',   {name:{type: Sequelize.STRING}});

// Enums
let RatingChannel = {buyer:'buyer'};
let RatingCriteria = {general:'general'};
//let User = models.User;
//let Company = models.Company;
//let Auction = models.Auction;

var obj = require('../index')(sequelize, 'RatingEvent', 'Rating', RatingChannel, RatingCriteria, User, Company, Company, Auction, {});
var Rating = obj.Rating;
var RatingEvent = obj.RatingEvent;

let c1, c2,  u1, a1;

describe('Array', function() {
    let firstCompanyVotes = 2;
    let secondCompanyVotes = 4;
    var firstCompanyTotalRating = 0;
    var secondCompanyTotalRating = 0;
    var currentRating = 0;
    var c1, c2, u1, a1;


    beforeEach(function* (){
        for(let model of modelsArray){
            yield model.sync({force:true});
        }
        c1 = yield Company.create();
        c2 = yield Company.create();
        u1 = yield User.create();
        a1 = yield Auction.create();
        yield RatingEvent.sync({force:true});
        yield Rating.sync({force:true});
    });

    let generateData = function* () {
        var i = 0;
        firstCompanyTotalRating = 0;
        secondCompanyTotalRating = 0;
        /*
         Company 2 rates company 1
         n times with random ratings
         */

        for(i = 0; i < secondCompanyVotes; i++) {
            currentRating = _.random(1, 5);
            firstCompanyTotalRating += currentRating;

            yield RatingEvent.add({
                rate: currentRating,
                note: 'Comment for rate: ' + currentRating,
                FromId: c2.id,
                ToId: c1.id,
                UserId: u1.id,
                ContextId: a1.id,
                criteria: RatingCriteria.general,
                channel: RatingChannel.buyer
            });
        }

        /*
         Company 1 rates company 2
         n times with random ratings
         */

        for(i = 0; i < firstCompanyVotes; i++) {
            currentRating = _.random(1, 5);
            secondCompanyTotalRating += currentRating;

            yield RatingEvent.add({
                rate: currentRating,
                note: 'Comment for rate: ' + currentRating,
                FromId: c1.id,
                ToId: c2.id,
                UserId: u1.id,
                ContextId: a1.id,
                criteria: RatingCriteria.general,
                channel: RatingChannel.buyer
            });
        }

    };

    it('should return results for first & second ratings and empty for the third', function* () {
        yield generateData();

        let firstCompanyRating = yield Rating.get(c1.id);
        let secondCompanyRating = yield Rating.get(c2.id);
        let thirdCompanyRating = yield Rating.get(12);

        expect(firstCompanyRating.total).to.equal(firstCompanyTotalRating);
        expect(firstCompanyRating.count).to.equal(secondCompanyVotes);

        expect(secondCompanyRating.total).to.equal(secondCompanyTotalRating);
        expect(secondCompanyRating.count).to.equal(firstCompanyVotes);

        expect(thirdCompanyRating.total).to.equal(0);
        expect(thirdCompanyRating.count).to.equal(0);
    });

    it('should compute the averate rating of a company', function* () {
        yield generateData();

        let firstCompanyAverage = yield Rating.getAverage(c1.id);
        let secondCompanyAverage = yield Rating.getAverage(c2.id);
        let computedFirstCompany = (firstCompanyTotalRating / secondCompanyVotes).toFixed(2);
        let computedSecondCompany = (secondCompanyTotalRating / firstCompanyVotes).toFixed(2);

        console.log(
            'firstCompanyAverage',
            firstCompanyAverage,
            'secondCompanyAverage',
            secondCompanyAverage,
            'computedFirstCompany',
            computedFirstCompany,
            'computedSecondCompany',
            computedSecondCompany
        );

        expect(firstCompanyAverage).to.equal(computedFirstCompany);
        expect(secondCompanyAverage).to.equal(computedSecondCompany);
    });
});

