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

            result.forEach(function (r) {
                var inList = false;
                var i = 0;
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
 * @param {String} :id The ID used to identify the specified memory model
 * @param {Number} :version? Optional parameter to get a specified version of the memory model
 *
 * @return {String|Array} Errorstring or Object containing the memory model
 */

router.get('/:id/:version?', function (req, res) {

    var mmid = req.params.id;
    var version = (req.params.version) ? parseInt(req.params.version) : null;

    console.log(mmid);
    console.log(version);

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
 *  Post a memory model with a given ID.
 *
 *  @return {String} Message containing the status whether it succeeded or not
 */

router.post('/', function (req, res) {

    //TODO extract variables from req body
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
        return res.send("memory model created");
    }).catch(function(err){
        return res.send("something went wrong" + err);
    })
});


router.delete('/:id/:version', function (req,res){
    var mmid = req.params.id;
    var version = parseInt(req.params.version);

    r.db('percolatordb').table('History').filter(r.row('mmid').eq(mmid).and(r.row("version").eq(version))
    ).delete().run(connection, function (err, result) {
            if (err)
                return res.send("unexpected error: " + err);

            return res.send("Delete request completed");
        });

});

module.exports = router;