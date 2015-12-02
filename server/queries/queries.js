var r = require("rethinkdb");
var config = require('./../../config.js');

var connection = null;
r.connect(config.rethinkdb).then(function (conn) {
    connection = conn;
});

var queries = {};

queries.getAll = function (cb) {
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

queries.getMemoryModelById = function (mmid, cb) {
    r.db('percolatordb')
        .table('ModelInfo')
        .eqJoin('id',
        r.db('percolatordb')
            .table('History'),
        {index: 'mmid'})
        .zip() // merge the two fields into a single document.
        .orderBy(r.desc('version'))
        .filter(function (row) {
            return row("mmid").eq(mmid);
        })
        .coerceTo('array') // making a array instead of object
        .run(connection, function (err, result) {
            cb(err, result);
        })
};

queries.getMemoryModelByIdAndVersion = function (mmid, version, cb) {
    r.db('percolatordb')
        .table('ModelInfo')
        .eqJoin('id',
        r.db('percolatordb')
            .table('History'),
        {index: 'mmid'})
        .zip() // merge the two fields into a single document.
        .orderBy(r.desc('version'))
        .filter(function (row) {
            return ( row("mmid").eq(mmid).and(row("version").eq(version)));
        })
        .coerceTo('array') // making a array instead of object
        .run(connection, function (err, result) {
            cb(err, result);
        })
};

queries.createNewMemoryModel = function (data, cb) {

    var language = data.language;
    var owner = data.owner;
    var modelName = data.modelName;
    var mmid;

    return new Promise(function (resolve, reject) {
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
    }).then(function (data) {
            return new Promise(function (resolve, reject) {
                mmid = data.generated_keys[0];
                r.db('percolatordb')
                    .table('History')
                    .insert({
                        mmid: mmid,
                        modelName: modelName,
                        version: 0
                    })
                    .run(connection, function (err, result) {
                        if (err) reject(err);
                        else resolve(result);
                    });
            });
        }).then(function () {
            return cb(null, {
                message: "memorymodel succesfully added",
                mmid: mmid
            });
        }).catch(function (err) {
            return cb(new Error("something went wrong! " + err), null);
        })
};

queries.subscribeToChanges = function (id, cb) {
    r.db('percolatordb')
        .table('History')
        .get(id)
        .changes()
        .run(connection, function (err, cursor) {
            cb(err, cursor);
        })
};

queries.deleteLatestversion = function (mmid, version, cb) {

    r.db('percolatordb')
        .table('History')
        .filter(r.row('mmid').eq(mmid).and(r.row("version").eq(version)))
        .delete()
        .run(connection, function (err, result) {
            cb(err, result);
        });
};

module.exports = queries;