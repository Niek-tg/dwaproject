var express = require('express');
var r = require("rethinkdb");
var config = require('./../../config.js');
var router = express.Router();

/**
 * Getting connected to the database.
 */

r.connect(config.rethinkdb).then(function (conn) {
    connection = conn;
    return r.dbList().run(connection)
});

/**
 * Get a list of all memory models.
 */

router.get('/', function (req, res) {

    r.db('percolatordb').table('ModelInfo').run(connection, function (err, result) {
        if (err) return res.send("ModelInfo cannot be returned: " + err);

        if (result) return res.send({
            msgType: "newData",
            data: result._responses[0].r
        });
    });
});

/**
 * Get a memory model with a given ID.
 */

router.get('/:id/:version?', function (req, res) {

    var mmid = parseInt(req.params.id);
    var version = parseInt(req.params.version);

    if (mmid) {
        r.db('percolatordb').table('ModelInfo').eqJoin('id', r.db('percolatordb').table('History'), {index: 'mmid'})
            .zip()// merge the two fields into a single document.
            .coerceTo('array') // making a array instead of object
            .run(connection, function (err, result) {
                console.log(mmid);
                console.log("RESULT");
                console.log(result);
                console.log("END");
                if (err) return res.send("unexpected error:" + err);

                if (result)
                    result.forEach(function (r) {
                        console.log(r);
                        if (r.mmid === mmid) {
                            if (version === "NaN"){
                                var lastModel = r.memoryModel[r.memoryModel.length-1];
                                //var modelDetails = {
                                //    owner: r.owner,
                                //    version: r.version,
                                //    memoryModel: lastModel
                                //    };
                                r.memoryModel = [lastModel];
                                return res.send(r);
                            }
                            else{

                            }
                            //return res.send(r);
                        }
                    });

                else return res.send("ID does not exist");
            });
    } else res.send("not a valid id");
});

/**
 * Post a memory model with a given ID.
 */

router.post('/', function (req, res) {
    res.send('Route POST MemoryModel');
});


module.exports = router;