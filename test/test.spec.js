'use strict';

// Include required modules
var co = require('co');
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
require('co-mocha');
var randomizeString = require('stray');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('ratings', 'postgres', 'pass', {
	host: 'localhost',
	dialect: 'postgres'
});

// model generator
var addModel = function(name, attribs, options){
	var model = sequelize.define(name, attribs, options);

	return model;
};

// cache definitions
var UserModel    = addModel('User', {name: {type: Sequelize.STRING}});
var ReferenceModel = addModel('Reference', {name: {type: Sequelize.STRING}});
var index = require('../index')(sequelize, UserModel, ReferenceModel);
var Rating = index.Rating;
var savedRow1, savedRow2, savedRow3, u1, u2, u3, r1, r2, r3, r4, r5, r6;

describe('Array', function() {
	// executed before each test
	beforeEach(function* () {
		yield UserModel.sync({force: true});
		yield ReferenceModel.sync({force: true});
		yield Rating.sync({force: true});

		u1 = yield UserModel.create({name: randomizeString()});
		u2 = yield UserModel.create({name: randomizeString()});
		u3 = yield UserModel.create({name: randomizeString()});

		r1 = yield ReferenceModel.create({name: randomizeString()});
		r2 = yield ReferenceModel.create({name: randomizeString()});
		r3 = yield ReferenceModel.create({name: randomizeString()});
		r4 = yield ReferenceModel.create({name: randomizeString()});
		r5 = yield ReferenceModel.create({name: randomizeString()});
		r6 = yield ReferenceModel.create({name: randomizeString()});
	});

	let seedData = function* () {
		savedRow1 = yield Rating.addModel({
			channel: 'buyer',
			criteria: 'general',
			UserId: u1.id,
			FromReferenceId: r1.id,
			ToReferenceId: r2.id,
			rate: 3,
			note: randomizeString()
		});

		savedRow2 = yield Rating.addModel({
			channel: 'buyer',
			criteria: 'general',
			UserId: u3.id,
			FromReferenceId: r3.id,
			ToReferenceId: r4.id,
			rate: 2,
			note: randomizeString()
		});

		savedRow3 = yield Rating.addModel({
			channel: 'seller',
			criteria: 'general',
			UserId: u2.id,
			FromReferenceId: r5.id,
			ToReferenceId: r6.id,
			rate: 5,
			note: randomizeString()
		});
	};

	it('should add records', function* () {
		yield seedData();

		expect(savedRow1).to.be.a('object');
		expect(savedRow2).to.be.a('object');
		expect(savedRow3).to.be.a('object');
	});
});