/**
 * Created by Dion Koers on 1-12-2015.
 */
var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('./../app.js');
var api = supertest(app);

describe('API memorymodels unit test', function () {

    it('Retrieve multiple versions of a memory model', function (done) {
        api
            .get('/api/memorymodels/"92524038-f0e2-4db2-ad01-321a9040df02"')
            .set('Accept', 'application/json')
            .end(function (err) {
                if (err) return done(err);
                api
                    .get('/api/memoryModels/"92524038-f0e2-4db2-ad01-321a9040df02"/2')
                    .set('Accept', 'application/json')
                    .end(function (err2) {
                        if (err2) return done(err2);
                    });
                done();
            });
    });
});

/* POST Test */

describe('API memorymodels POST', function () {
    it('Should return a 200 response', function (done) {
        api
            .get('/api/memorymodels')
            .set('Accept', 'application/json')
            .expect(200, done)
    });

    it('Route POST information about the model', function (done) {
        api
            .post('/api/memorymodels/')
            .send({
                language: 'Javascript',
                modelName: 'testModel',
                owner: 'testerDion',
                version: 1
            })
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.message.should.equal('memorymodel succesfully added');
                done();
            });
    });
});

/* GET TEST */
describe('API memorymodels GET', function () {

    var mmid
    it('Should return a 200 response', function (done) {
        api
            .get('/api/memorymodels')
            .set('Accept', 'application/json')
            .expect(200, done)
    });

    it('Route GET information about the model', function (done) {
        api
            .post('/api/memorymodels/')
            .send({
                language: 'Javascript',
                modelName: 'testModel',
                owner: 'testerDion',
                version: 1
            })
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {

                if (err) return done(err)
                mmid = res.body.mmid.toString();
                api
                    .get('/api/memorymodels/' + mmid)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .end(function (err, res) {

                        //console.log(mmid);
                        //console.log(res.body);
                        if (err) return done(err);
                        res.should.be.json;
                        res.body.mmid.should.equal(mmid);

                        /*Check if the property are present*/

                        expect(res.body).to.have.property('id');
                        expect(res.body.id).to.not.equal(null);
                        expect(res.body).to.have.property('language');
                        expect(res.body.language).to.not.equal(null);
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

    afterEach(function (done) {
        api
            .del('/api/memorymodel' + mmid)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });
});

/* Error handling */

describe('API memorymodels ERROR handling', function () {

    it('API does not exist!', function (done) {
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
            .get('/api/memorymodels/mmmmmmmmmmmmmmmmmmmmm/99999999999999')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.text.should.equal('ID or version does not exist');
                done();
            });
    });
});

