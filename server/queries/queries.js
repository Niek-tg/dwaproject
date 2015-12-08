var r = require("rethinkdb");
var config = require('./../../config.js');

var connection;
var queries = {};

function getConnection(cb) {
    if (connection) cb(null, connection);
    else r.connect(config.rethinkdb, function (err, conn) {
        if (err) return cb(err, null);
        connection = conn;
        console.log("connected");
        cb(null, connection);
    });
}

queries.getAll = function (cb) {
    getConnection(function (err, conn) {
        if (err) return cb(err, null);
        r.db('percolatordb')
            .table('ModelInfo')
            .eqJoin('id',
            r.db('percolatordb')
                .table('History'),
            {index: 'mmid'})
            .zip() // merge the two fields into a single document.
            .coerceTo('array') // making a array instead of object
            .run(conn, function (err, result) {
                cb(err, result);
            })
    });
};

queries.getMemoryModelById = function (mmid, cb) {
    getConnection(function (err, conn) {
        if (err) return cb(err, null);
        r.db('percolatordb')
            .table('ModelInfo')
            .eqJoin('id',
            r.db('percolatordb')
                .table('History'),
            {index: 'mmid'})
            .zip() // merge the two fields into a single document.
            .eqJoin('mmid',
            r.db('percolatordb')
                .table('Layout'),
            {index: 'mmid'})
            .zip() // merge the two fields into a single document.
            .orderBy(r.desc('version'))
            .filter(function (row) {
                return row("mmid").eq(mmid).and(row("version").eq(row('modelVersion')));
            })
            .coerceTo('array') // making a array instead of object
            .run(conn, function (err, result) {
                cb(err, result);
            })
    });
};

queries.getMemoryModelByIdAndVersion = function (mmid, version, cb) {
    getConnection(function (err, conn) {
        if (err) return cb(err, null);
        r.db('percolatordb')
            .table('ModelInfo')
            .eqJoin('id',
            r.db('percolatordb')
                .table('History'),
            {index: 'mmid'})
            .zip() // merge the two fields into a single document.

            .eqJoin('mmid',
            r.db('percolatordb')
                .table('Layout'),
            {index: 'mmid'})
            .zip() // merge the two fields into a single document.
            .orderBy(r.desc('version'))
            .filter(function (row) {
                return ( row("mmid").eq(mmid).and(row("version").eq(version)).and(row("version").eq(row('modelVersion'))));
            }).without('modelVersion')
            .coerceTo('array') // making a array instead of object
            .run(conn, function (err, result) {
                cb(err, result);
            })
    });
};

queries.createNewMemoryModel = function (data, cb) {

    var language = data.language;
    var owner = data.owner;
    var modelName = data.modelName;
    var mmid;
    var version = 0;

    return new Promise(function (resolve, reject) {
        getConnection(function (err, conn) {
            if (err) return reject(err, null);
            r.db('percolatordb')
                .table('ModelInfo')
                .insert({
                    language: language,
                    owner: owner
                })
                .run(conn, function (err, result) {
                    if (err) reject(err);
                    else resolve(result);
                })
        });
    }).then(function (data) {
            return new Promise(function (resolve, reject) {
                getConnection(function (err, conn) {
                    if (err) return reject(err, null);
                    mmid = data.generated_keys[0];
                    r.db('percolatordb')
                        .table('History')
                        .insert({
                            mmid: mmid,
                            modelName: modelName,
                            version: version
                        })
                        .run(conn, function (err, result) {
                            if (err) reject(err);
                            else resolve(result);
                        });
                });
            });
        }).then(function (data) {
            return new Promise(function (resolve, reject) {
                getConnection(function (err, conn) {
                    if (err) return reject(err, null);
                    r.db('percolatordb')
                        .table('Layout')
                        .insert({
                            mmid: mmid,
                            modelVersion: version,
                            frameLocations: []
                        })
                        .run(conn, function (err, result) {
                            if (err) reject(err);
                            else resolve(result);
                        });
                });
            });
        })
        .then(function () {
            return cb(null, {
                message: "memorymodel succesfully added",
                mmid: mmid
            });
        }).catch(function (err) {
            return cb(new Error("something went wrong! " + err), null);
        })
};

queries.subscribeToChanges = function (id, cb) {
    getConnection(function (err, conn) {
        if (err) return cb(err, null);

        r.db('percolatordb')
            .table('History')
            .get(id)
            .changes()
            .run(conn, function (err, cursor) {
                cb(err, cursor);
            })
    });
};

queries.deleteLatestversion = function (mmid, version, cb) {
    getConnection(function (err, conn) {
        if (err) return cb(err, null);
        r.db('percolatordb')
            .table('History')
            .filter(r.row('mmid').eq(mmid).and(r.row("version").eq(version)))
            .delete()
            .run(conn, function (err, result) {
                cb(err, result);
            });
    });
};


module.exports = queries;