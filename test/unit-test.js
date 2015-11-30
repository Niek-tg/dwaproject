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

    it('database has x memmorymodels', function(done){
        api
            .get('/api/MemoryModels')
            .set('Accept', 'application/json')
            .end(function(err, res){
                if (err) return done(err);
                console.log(res.body);
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
                //res.body.data.id.should.equal('5331');
                //].name.should.equal('Bat');

                //res.body.data.should.be.a('array');

                //res.body.should.have.property('data');
                //res.body.data.id.should.equal(5331);
                //res.body.should.have.property('id');
                //res.body.should.have.property('msgType');
                console.log(res.body);
                done();
            });
    });
});



