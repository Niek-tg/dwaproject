var should = require('chai').should();
var expect = require('chai').expect;
var queries = require('../server/queries/queries.js');


describe('query getAllMemoryModels', function () {
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

describe('query getModelById', function () {

    it('Should get models with given MMID', function (done) {
       queries.getMemoryModelById('1ee3f80e-c107-4fa2-9bc4-4f24887d1754',function(err,res){
           expect(res.length).to.equal(3);
           expect(res[0].mmid).to.equal(res[1].mmid).and.to.equal(res[2].mmid);
           done();
       })
    });

    it('Should get model with given MMID and version', function (done) {
        queries.getMemoryModelByIdAndVersion('1ee3f80e-c107-4fa2-9bc4-4f24887d1754',1 ,function(err,res){
            expect(res[0].version).to.equal(1);
            expect(res[0].owner).to.equal('Pietertje');
            expect(res[0].language).to.equal('Javascript');
            done();
        })
    });
});


describe('query removeLatestVersion', function () {

    it('Should remove latest version of model with given version and mmid', function (done) {
        queries.deleteLatestversion('1ee3f80e-c107-4fa2-9bc4-4f24887d1754',1,function(err,res){
           queries.getMemoryModelById('1ee3f80e-c107-4fa2-9bc4-4f24887d1754',function(err,res2){
               expect(res2.length).to.equal(2);
               expect(res2[3]).to.equal(undefined);
               done();
          });
        })
    });
//TODO add delete check for non existing memory model (versions)
    //it('Should return an error when deleting a non-existing version of a memory model', function(done){
    //    queries.deleteLatestversion('1ee3f80e-c107-4fa2-9bc4-4f24887d1754',55,function(err,res){
    //        console.log("err: ", err);
    //        console.log("res: ", res);
    //        done();
    //    })
    //})
});


describe('query updateMemoryModel', function () {
   it('Should update a memory model with new info', function(done){
       queries.getMemoryModelById('1ee3f80e-c107-4fa2-9bc4-4f24887d1754',function(err,res){
           res[0].owner = "TestName";

           queries.updateMemoryModel(res[0],function(err,res2){
               queries.getMemoryModelById('1ee3f80e-c107-4fa2-9bc4-4f24887d1754',function(err,res2) {
                   expect(res2[0].owner).to.equal('TestName');
               });
               done();
           })
       });
   });

    this.timeout(10000);
    after(function(done){
        require("./../server/seedScript").runSeed(done);
    });
});



