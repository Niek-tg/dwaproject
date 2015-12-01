var r = require("rethinkdb");
var config = require('./../../config.js');

var connection = null;
r.connect(config.rethinkdb).then(function (conn) {
    connection = conn;
});

var queries = {};

queries.getAll = function(cb){
    r.db('percolatordb')
        .table('ModelInfo')
        .eqJoin('id',
        r.db('percolatordb')
            .table('History'),
        {index: 'mmid'})
        .zip() // merge the two fields into a single document.
        .coerceTo('array') // making a array instead of object
        .run(connection, function (err, result) {
            cb(err, result);
        })
};

queries.getMemoryModelById = function (mmid, cb){
    console.log(mmid);
    r.db('percolatordb')
        .table('ModelInfo')
        .eqJoin('id',
        r.db('percolatordb')
            .table('History'),
        {index: 'mmid'})
        .zip() // merge the two fields into a single document.
        .orderBy(r.desc('version'))
        .filter(function(row){
            return row("mmid").eq(mmid);
        })
        .coerceTo('array') // making a array instead of object
        .run(connection, function (err, result) {
            cb(err, result);
        })
};

queries.getMemoryModelByIdAndVersion = function (mmid, version, cb){
    r.db('percolatordb')
        .table('ModelInfo')
        .eqJoin('id',
        r.db('percolatordb')
            .table('History'),
        {index: 'mmid'})
        .zip() // merge the two fields into a single document.
        .orderBy(r.desc('version'))
        .filter(function(row){
            return ( row("mmid").eq(mmid).and(row("version").eq(version)));
        })
        .coerceTo('array') // making a array instead of object
        .run(connection, function (err, result) {
            cb(err, result);
        })
};

queries.createNewMemoryModel = function(cb){

    var language = "Javascript";
    var owner = "Dickie Curtis";
    var modelName = "Dickie Curtis MemoryModel";

    return new Promise(function(resolve, reject){
        r.db('percolatordb')
            .table('ModelInfo')
            .insert({
                language: language,
                owner: owner
            })
            .run(connection, function (err, result) {
                if (err) reject(err);
                else resolve(result);
            })
    }).then(function(data){
            return new Promise (function(resolve, reject){
                r.db('percolatordb')
                    .table('History')
                    .insert({
                        mmid: data.generated_keys[0],
                        modelName: modelName,
                        version: 0
                    })
                    .run(connection, function (err, result) {
                        if (err) reject(err);
                        else resolve(result);
                    });
            });
    }).then(function(){
            return cb(null, "memorymodel succesfully added");
    }).catch(function(err){
            return cb(new Error("something went wrong! " + err), null);
    })
};

queries.subscribeToChanges = function(id, cb){
    r.db('percolatordb')
        .table('History')
        .get(id)
        .changes()
        .run(connection, function (err, cursor) {
            console.log();
            cb(err, cursor);
        })
};

queries.deleteLatestversion = function(mmid, version, cb){

    r.db('percolatordb')
        .table('History')
        .filter(r.row('mmid').eq(mmid).and(r.row("version").eq(version)))
        .delete()
        .run(connection, function (err, result) {
            cb(err, result);
        });
};

module.exports = queries;