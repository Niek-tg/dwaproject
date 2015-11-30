var express = require('express');
var r = require("rethinkdb");
var config = require('./../../config.js');
var router = express.Router();

/**
 * Getting connected to the database.
 *
 * @returns {String|Array} List of all the databases which are in the RethinkDB server
 */

r.connect(config.rethinkdb).then(function (conn) {
    connection = conn;
    return r.dbList().run(connection)
});


/**
 * Get a list of all memory models.
 *
 * @returns {Object|Array} Returns a list of the latest versions of all the available memory models
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

            var resultsArray = [];
            var i = 0;

            /**
             * Shows only the latest version of a memory model.
             */
            result.forEach(function (r) {
                var inList = false;
                resultsArray.forEach(function (result) {
                    if (r.mmid === result.mmid) {
                        inList = true;
                        if (r.version > result.version) {
                            resultsArray[i] = r;
                        }
                    }
                    else inList = false;
                    i++;
                });
                if (inList === false) {
                    resultsArray.push(r);
                }
            });
            return res.send(resultsArray);
        });
});




/**
 * Get a memory model with a given ID.
 *
 * @param {String} :id the ID used to identify the specified memory model
 * @param {Number} :version? Optional parameter to get a specified version of the memory model
 */

router.get('/:id/:version?', function (req, res) {

    var mmid = req.params.id;
    var version = (req.params.version) ? req.params.version : null;

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
                if(version)return ( row("mmid").eq(mmid).and(row("version").eq(version)));
                else return row("mmid").eq(mmid);
            })
            .coerceTo('array') // making a array instead of object
            .run(connection, function (err, result) {
                console.log(result);
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