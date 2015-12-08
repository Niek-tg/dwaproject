var express = require('express');
var router = express.Router();
var queries = require('./../queries/queries.js');

/**
 * Get a list of all memory models.
 *
 * @returns {Object|Array} Returns a list of the latest versions of all the available memory models
 */
router.get('/', function (req, res) {
    queries.getAll(function (err, result) {
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

    if (mmid) {
        var cb = function (err, result) {
            if (err)
                return res.send("unexpected error: " + err);

            if (result[0])
                return res.send(result[0]);

            return res.send("ID or version does not exist");
        };

        if (version) queries.getMemoryModelByIdAndVersion(mmid, version, cb);
        else query = queries.getMemoryModelById(mmid, cb);

    } else return res.send("not a valid id");

});

/**
 *  Post a memory model with a given ID.
 *
 *  @return {String} Message containing the status whether it succeeded or not
 */

router.post('/', function (req, res) {

    var language = req.body.language;
    var owner = req.body.owner;
    var modelName = req.body.modelName;

    queries.createNewMemoryModel({language: language, owner: owner, modelName: modelName},function(err, result){
        if(err) res.send("er ging iets mis " + err);

            res.send(result);
    });

});

/**
 * Delete a memory model with a given ID and version.
 */
router.delete('/:id/:version', function (req,res){
    var mmid = req.params.id;
    var version = parseInt(req.params.version);
    queries.deleteLatestversion(mmid, version, function (err, result) {
        if (err)
            return res.send("unexpected error: " + err);

        return res.send("Delete request completed");
    });
});

module.exports = router;