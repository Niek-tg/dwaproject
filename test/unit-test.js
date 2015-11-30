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
                .get('/api/MemoryModels')
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
            .get('/api/MemoryModels/5331')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                res.body.should.be.a('object');
                res.should.be.json;

                //console.log(res.body);
                done();
            });
    });
});



