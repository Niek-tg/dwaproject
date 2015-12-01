/**
 * Created by Dion Koers on 1-12-2015.
 */
var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('./../app.js');
var api = supertest(app);


var MEMORYMODEL = '92524038-f0e2-4db2-ad01-321a9040df02';

describe('API memorymodels unit test', function () {

    it('Should return a 200 response', function (done) {
        api
            .get('/api/memorymodels')
            .set('Accept', 'application/json')
            .expect(200, done)
    });

    it('Retrieve multiple versions of a memory model', function (done) {
        //Get version 1 of memory model 5331
        api
            .get('/api/memorymodels/MEMORYMODEL/1')
            .set('Accept', 'application/json')
            .end(function (err) {
                if (err) return done(err);
                console.log("GET on version 1 succeeded.");

                //Get version 2 of memory model 5331
                api
                    .get('/api/memoryModels/MEMORYMODEL/2')
                    .set('Accept', 'application/json')
                    .end(function (err2) {
                        if (err2) return done(err2);
                        console.log("GET on version 2 succeeded.")
                    });
                done();
            });
    });

    it('database has memmorymodel: 92524038-f0e2-4db2-ad01-321a9040df02', function (done) {
        api
            .get('/api/memorymodels/' + MEMORYMODEL)
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.should.be.json;
                res.body.mmid.should.equal('92524038-f0e2-4db2-ad01-321a9040df02');
                done();
            });
    });

    it('memmorymodel has propertys\'s', function (done) {
        api
            .get('/api/memorymodels/' + MEMORYMODEL)
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.should.be.json;

                    expect(res.body).to.have.property('id');
                    expect(res.body.id).to.not.equal(null);
                    expect(res.body).to.have.property('language');
                    expect(res.body.language).to.not.equal(null);
                    expect(res.body).to.have.property('memoryModel');
                    expect(res.body.memoryModel).to.not.equal(null);
                    expect(res.body).to.have.property('mmid');
                    expect(res.body.mmid).to.not.equal(null);
                    expect(res.body).to.have.property('modelName');
                    expect(res.body.modelName).to.not.equal(null);
                    expect(res.body).to.have.property('owner');
                    expect(res.body.owner).to.not.equal(null);
                    expect(res.body).to.have.property('version');
                    expect(res.body.version).to.not.equal(null);

                done();
            });
    });
});

describe('API memorymodels ERROS handling', function () {

    it('API does not exict!', function (done) {
        api
            .get('/zapii/')
            .set('Accept', 'application/json')
            .expect(404)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });

    it('ID or Version does not exist', function (done) {
        api
            .get('/api/memorymodels/1/99999999999999')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.text.should.equal('ID or version does not exist');
                done();
            });
    });

    it('Not a valid id', function (done) {
        api
            .get('/api/memorymodels/w9238492ASDASd/10')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                console.log(res.text);
                console.log('Nog meerasjdlaksdj');
                res.text.should.equal('ID or version does not exist');
                done();
            });
    });
});


describe('API memorymodels POST', function () {
 var mmid;
        it('Route POST MemoryModel', function (done) {
        api
            .post('/api/memorymodels/')
            .send({
                language: 'Javascript',
                memoryModel: null,
                modelName: 'testModel',
                model: {
                    "heap": [
                        {
                            "funcs": null,
                            "id": 6,
                            "name": null,
                            "order": 1,
                            "vars": [
                                {
                                    "id": 7,
                                    "name": "0",
                                    "reference": 8,
                                    "undefined": false,
                                    "value": null
                                },
                                {
                                    "id": 200,
                                    "name": "1",
                                    "reference": 23,
                                    "undefined": false,
                                    "value": null
                                },
                                {
                                    "id": 120,
                                    "name": "2",
                                    "reference": 27,
                                    "undefined": false,
                                    "value": "unique id"
                                }
                            ]
                        }],
                    "stack": [
                        {
                            "funcs": [
                                {
                                    "id": 5,
                                    "name": "Person",
                                    "reference": 16
                                }
                            ],
                            "id": 1,
                            "name": "Geheugenmodel versie 3",
                            "order": 1,
                            "vars": [
                                {
                                    "id": 2,
                                    "name": "Pieters familie",
                                    "reference": 7,
                                    "undefined": false,
                                    "value": null
                                },
                                {
                                    "id": 3,
                                    "name": "Test",
                                    "reference": null,
                                    "undefined": false,
                                    "value": null
                                },
                                {
                                    "id": 4,
                                    "name": "Prima",
                                    "reference": null,
                                    "undefined": true,
                                    "value": null
                                }
                            ]

                        }]},
                    owner: 'testerDion',
                    version: 1
                })
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.message.should.equal('memory model created');
                mmid = res.body.mmid;
                done();
            });
    });

    afterEach(function(done){
        api
            .delete('api/memorymodels/mmid')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                res.test('Delete request completed');
                res.body.message.should.equal('memory model created');
            }
            done();

    });
});


