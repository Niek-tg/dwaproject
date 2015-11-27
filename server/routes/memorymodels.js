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

    r.db('percolatordb').table('ModelInfo').eqJoin('id', r.db('percolatordb').table('History'), {index: 'mmid'})
        .zip()// merge the two fields into a single document.
        .coerceTo('array') // making a array instead of object
        .run(connection, function (err, result) {
            console.log("RESULT OF GET ALL");
            console.log(result);
            //var resultsArray = [];

            //result.forEach(function(r){
            //   if(resultsArray.length === 0){
            //       resultsArray.push(r);
            //    }
            //    else{
            //       var i =0;
            //       resultsArray.forEach(function(result){
            //           if (r.mmid === result.mmid){
            //               resultsArray[i] = result;
            //           }
            //           i++;
            //       })
            //   }
            //    console.log("RESULTARRAY");
            //    console.log(resultsArray);
            //});

            if (result) return res.send({
                msgType: "newData",
                data: result
            });
        });
});

/**
 * Get a memory model with a given ID.
 */

router.get('/:id/:version?', function (req, res) {

    var mmid = parseInt(req.params.id);
    var version = (req.params.version) ? parseInt(req.params.version) : null;

    if (mmid) {
        r.db('percolatordb').table('ModelInfo').eqJoin('id', r.db('percolatordb').table('History'), {index: 'mmid'})
            .zip()// merge the two fields into a single document.
            .coerceTo('array') // making a array instead of object
            .run(connection, function (err, result) {

                if (err) return res.send("unexpected error:" + err);

                var resultsArray = [];
                if (result) {
                    result.forEach(function (r) {
                        console.log(mmid);
                        console.log(r.mmid);
                        if (r.mmid == mmid)
                            resultsArray.push(r);
                    });
                    console.log(resultsArray);
                    if (!version) {
                        console.log("in de !version");
                        var highestVersion = {version: 0};
                        resultsArray.forEach(function (v) {
                            console.log("IK KOM bijna ERIN");
                            console.log(v.version);
                            if (v.version > highestVersion.version) {
                                console.log("IK KOM ERIN");
                                highestVersion = v;
                            }
                        });
                        res.send(highestVersion);
                    }
                    else {

                        resultsArray.forEach(function (v) {
                            if (v.version === version) {
                                res.send(v);
                            }
                        });
                    }


                }
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