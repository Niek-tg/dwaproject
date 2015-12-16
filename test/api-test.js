var should = require('chai').should();
var expect = require('chai').expect;
var queries = require('../server/queries/queries.js');




describe('MessageHandler getAllMemoryModels', function () {
    this.timeout(10000);

    before(function(done){
        require("./../server/seedScript").runSeed(done);
    });

    it('Should get all memory models', function (done) {
        queries.getAll(function(err,res){
            expect(res.length).to.equal(5);
            expect(res[0]).to.have.property('id');
            expect(res[0].id).to.not.equal(null);
            expect(res[0]).to.have.property('language');
            expect(res[0].language).to.not.equal(null);
            expect(res[0]).to.have.property('mmid');
            expect(res[0].mmid).to.not.equal(null);
            expect(res[0]).to.have.property('modelName');
            expect(res[0].modelName).to.not.equal(null);
            expect(res[0]).to.have.property('owner');
            expect(res[0].owner).to.not.equal(null);
            expect(res[0]).to.have.property('version');
            expect(res[0].version).to.not.equal(null);
            done();
        })
    });
});

/* POST Test */

xdescribe('API memorymodels POST', function () {
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
xdescribe('API memorymodels GET', function () {

    var mmid;
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

                if (err) return done(err);
                mmid = res.body.mmid.toString();
                api
                    .get('/api/memorymodels/' + mmid)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .end(function (err, res) {

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
});


xdescribe('API memorymodels ERROR handlasding', function () {

    it('API does not exist', function (done) {
        api
            .del('/api/memoryModels/92524038-f0e2-4db2-ad01-321a9040df02/1')
            .end(function (err, res) {
                if (err) return done(err);
                res.text.should.equal('Delete request completed');
                done();
            });
    });
});


/* Error handling */

xdescribe('API memorymodels ERROR handling', function () {

    it('API does not exist!', function (done) {
        api
            .get('/NotExistingRoute/')
            .set('Accept', 'application/json')
            .expect(404)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });

    it('ID or Version does not exist', function (done) {
        api
            .get('/api/memorymodels/NotExistingMemoryModel/99999999999999')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.text.should.equal('ID or version does not exist');
                done();
            });
    });
});

