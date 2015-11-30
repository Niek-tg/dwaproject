var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('./../app.js');
var api = supertest(app);


/*
*  Unit tests
*
*  - Route connection - done
*  - Database bevat x aantal geheugenmodellen - done
*  - Database bevat de juiste geheugenmodellen - done
*  - Communicatie met de routes lukt
*  - Resultaat uit de database klopt
*  -
* */



describe('API memorymodels unit test', function(){

    it('Route connection established', function(done){
        api
                .get('/api/memorymodels')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function(err, res){
                if (err) return done(err);
                    done();
                });
    });

    it('Retrieve multiple versions of a memory model', function(done){
        //Get version 1 of memory model 5331
        api
            .get('/api/MemoryModels/5331/1')
            .get('/api/memorymodels')
            .set('Accept', 'application/json')
            .end(function(err, res){
                if (err) return done(err);
               console.log("GET on version 1 succeeded.");

                //Get version 2 of memory model 5331
                api
                    .get('/api/memoryModels/5331/2')
                    .set('Accept', 'application/json')
                    .end(function(err2,res2){
                       if(err2) return done(err2);

                        console.log("GET on version 2 succeeded.")
                    });


                done();
            });
    });

    it('database has memmorymodel 5331', function(done){
        api
            .get('/api/memorymodels/5331')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                res.should.be.json;
                res.body.mmid.should.equal(5331);
                done();
            });
    });

    it('memmorymodel has propertys\'s', function(done){
        api
            .get('/api/memorymodels/5331')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                res.should.be.json;

                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('language');
                expect(res.body).to.have.property('memoryModel');
                expect(res.body).to.have.property('mmid');
                expect(res.body).to.have.property('modelName');
                expect(res.body).to.have.property('owner');
                expect(res.body).to.have.property('version');

                done();
            });
    });
});

describe('API memorymodels ERROS handling', function() {

    it('API does not exict !', function (done) {
        api
            .get('/zapii/')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('ID Version or does not exist', function (done) {
        api
            .get('/api/memorymodels/1/99999')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.text.should.equal('ID or version does not exist');
                console.log(res.text);
                done();
            });
    });

    it('Not a valid id', function (done) {
        api
            .get('/api/memorymodels/w/10')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.text.should.equal('not a valid id');
                console.log(res.text);
                done();
            });
    });
});



