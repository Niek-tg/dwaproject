/**
 * Require rethinkdb database and require config file for connection with the database
 * @type {rethinkdb|exports|module.exports}
 */

var r = require("rethinkdb");
var config = require('./../../config.js');
var connection;
var queries = {};


/**
 * Gets a connection with the rethinkDB by config.js
 * @param cb callback for this function that returns an rethinkdb database connection
 */
function getConnection(cb) {
    if (connection) cb(null, connection);
    else r.connect(config.rethinkdb, function (err, conn) {
        if (err) return cb(err, null);
        connection = conn;
        cb(null, connection);
    });
}

/**
 * Query to get all memorymodels
 * @param cb callback for this function
 */
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
            .coerceTo('array') // making an array instead of object
            .run(conn, function (err, result) {
                cb(err, result);
            })
    });
};


/**
 * Query to get memorymodel on id
 * @param mmid Memorymodel ID
 * @param cb Callback for this function
 */
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
            .orderBy(r.desc('version'))
            .filter(function (row) {
                return row("mmid").eq(mmid);
            })
            .coerceTo('array') // making an array instead of object
            .run(conn, function (err, result) {
                cb(err, result);
            })
    });
};

/**
 * Query to get memorymodel by ID and Version
 * mmid Memorymodel ID
 * @param cb Callback for this function
 * @param version Memorymodel version
 */
queries.getMemoryModelByIdAndVersion = function (mmid, version, cb) {
    getConnection(function (err, conn) {
        if (err) return cb(err, null);
        r.db('percolatordb')
            .table('ModelInfo')
            .eqJoin('id',
            r.db('percolatordb')
                .table('History'),
            {index: 'mmid'})
            .zip()// merge the two fields into a single document.
            .orderBy(r.desc('version'))
            .filter(function (row) {
                return ( row("mmid").eq(mmid).and(row("version").eq(version)));
            })
            .coerceTo('array') // making an array instead of object
            .run(conn, function (err, result) {
                cb(err, result);
            })
    });
};

/**
 * Query to create a new memorymodel
 * @param data JSON object of the new memorymodel
 * @param cb Callback of this function
 */
queries.createNewMemoryModel = function (data, cb) {

    var language = data.language;
    var owner = data.owner;
    var modelName = data.modelName;
    var mmid;
    var version = 0;
    var memoryModel = data.memoryModel;

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
                            version: version,
                            frameLocations: [],
                            memoryModel: memoryModel
                        })
                        .run(conn, function (err, result) {
                            if (err) reject(err);
                            else resolve(result);
                        });
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

/**
 * Query to check if the memorymodel has changed
 * @param id ID of one model
 * @param cb Callback of this function
 */

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

/**
 * Query to delete latest version of the memorymodel
 * @param mmid Memorymodel ID
 * @param version Memorymodel version
 * @param cb Callback of this function
 */
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

/**
 * Query to update stack and heap frame positions
 * @param positions Frame positions of the stack and heap frames
 * @param mmid Memorymodel ID
 * @param version Memorymodel version
 * @param cb Callback of this function
 */
queries.updateFramePositions = function (positions, mmid, version, cb) {
    console.log("IN QUERIES UPDATEFRAMEPOSITIONS");
    getConnection(function (err, conn) {
        if (err) return cb(err, null);
        r.db('percolatordb').table("History")
            .filter(r.row('mmid').eq(mmid).and(r.row("version").eq(version)))
            .update({"frameLocations": positions})
            .run(conn, function (err, result) {
                cb(err, result);
            })
    });
};



/**
 * Query to update memorymodel
 * @param memoryModel Memorymodel it self
 * @param cb Callback of this function
 */
queries.updateMemoryModel = function (memoryModel, oldMemoryModel, cb) {
    var mmid = memoryModel.mmid;
    var version = memoryModel.version;
    var id = memoryModel.id;
    console.log("oldMemoryModel.id");
    //console.log(oldMemoryModel.id);
    console.log(memoryModel);
    console.log("oldMemoryModel.id");
    console.log(oldMemoryModel);

    memoryModel.version += 1;

    var historyOldMemoryModel = {
        mmid: oldMemoryModel.mmid,
        version: oldMemoryModel.version,
        memoryModel: oldMemoryModel.memoryModel,
        modelName: oldMemoryModel.modelName,
        frameLocations: oldMemoryModel.frameLocations};

    var modelInfo = {id: memoryModel.mmid, owner: memoryModel.owner, language: memoryModel.language};


    return new Promise(function (resolve, reject) {
        getConnection(function (err, conn) {
            if (err) return cb(err, null);
            r.db('percolatordb').table("ModelInfo")
                .filter(r.row('id').eq(mmid))
                .replace(modelInfo)
                .run(conn, function (err, result) {
                    if (err) reject(err);
                    else resolve(result);
                })
        });

    }).then(function (data) {
            return new Promise(function (resolve, reject) {
                getConnection(function (err, conn) {
                    if (err) return cb(err, null);
                    r.db('percolatordb').table("History")
                        .filter(r.row('mmid').eq(mmid).and(r.row('version').eq(version)))
                        .update({"version": memoryModel.version, "memoryModel": memoryModel.memoryModel, "modelName": memoryModel.modelName, "frameLocations": memoryModel.frameLocations } )
                        .run(conn, function (err, result) {
                            if (err) reject(err);
                            else resolve(result);

                        });
                });

            });
        }).then(function (data) {
            return new Promise(function (resolve, reject) {
                getConnection(function (err, conn) {
                    if (err) return cb(err, null);
                    r.db('percolatordb').table("History")
                        .insert(historyOldMemoryModel)
                        .run(conn, function (err, result) {
                            if (err) reject(err);
                            else resolve(result);

                        });
                });

            });
        }).then(function(data){
         return cb(null, {
             message: "memorymodel succesfully updated",
             mmid: mmid
         });
        }).catch(function (err) {
            return cb(new Error("something went wrong! " + err), null);
        })
};

/**
 * Exports the queries for further use in different files.
 */
module.exports = queries;