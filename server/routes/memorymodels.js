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
    r.db('percolatordb')
        .table('ModelInfo')
        .eqJoin('id',
                r.db('percolatordb')
                .table('History'),
                {index: 'mmid'})
        .zip() // merge the two fields into a single document.
        .coerceTo('array') // making a array instead of object
        .run(connection, function (err, result) {
            if(err)
                return res.send({message: "something went wrong!"});

            if (!result)
                return res.send({message: "No memory models were found!"});

            return res.send(result);
        });
});


/**
 * Get a memory model with a given ID.
 *
 * @param :id the ID used to identify the specified memory model
 * @param :version? Optional parameter to get a specified version of the memory model
 */

router.get('/:id/:version?', function (req, res) {

    var mmid = parseInt(req.params.id);
    var version = (req.params.version) ? parseInt(req.params.version) : null;

    if (mmid) {
        r.db('percolatordb')
            .table('ModelInfo')
            .eqJoin('id',
                    r.db('percolatordb')
                    .table('History'),
                    {index: 'mmid'})
            .zip() // merge the two fields into a single document.
            .orderBy(r.desc('version'))
            .filter(function(row){
                if(version) return row("mmid").eq(mmid) && row("version").eq(version);
                else return row("mmid").eq(mmid);
            })
            .coerceTo('array') // making a array instead of object
            .run(connection, function (err, result) {
                if (err)
                    return res.send("unexpected error: " + err);

                if (result[0])
                    return res.send(result[0]);

                return res.send("ID or version does not exist");
            });
    } else return res.send("not a valid id");
});


/**
 * Post a memory model with a given ID.
 */

router.post('/', function (req, res) {
    res.send('Route POST MemoryModel');
});


module.exports = router;