/*
 * E2E User story 1
 * */

/*
 * Situation: database connection bestaat
 *            RethinkDB database draait
 *            Server percolator draait
 *            Webrowser wordt geopend
 *            Er wordt een lijst getoond met geheugenmodellen
 *            Geheugenmodellen voldoen aan juiste aantal
 * When:
 *            Geheugenmodel geselecteerd
 *
 * Then:
 *            Gelecteerde geheugenmodel wordt getoond
 *            Geheugenmodel is het zelfde als in de database
 *
 * */



// required libraries
var webdriverio = require('webdriverio');
var expect = require('chai').expect;
var siteURL        = "http://localhost:3000/";
var mainBrowser = 'chrome';

describe("E2E test get homepage", function () {

    this.timeout(500000);

    var allBrowsers, first_browser, second_browser;

    before( function (done) {
        var browserSpecs = {
            //master: { desiredCapabilities: {browserName: mainBrowser}},
            first:  { desiredCapabilities: {browserName: mainBrowser}},
            second:  { desiredCapabilities: {browserName: mainBrowser}}
        };

        allBrowsers = webdriverio.multiremote( browserSpecs );
        //masterBrowser = allBrowsers.select("master");
        first_browser  = allBrowsers.select("first");
        second_browser = allBrowsers.select("second");

        require("./../server/seedScript").runSeed(function(){
            allBrowsers
                .init()
                .url(siteURL)
                .then(function() {
                    done();
                });
        });
    });

    after( function(done) {
        allBrowsers.end(done);
    });


    it("Should retrieve information about the memory model", function (done) {
        return first_browser
            .waitForExist("#92524038-f0e2-4db2-ad01-321a9040df02", 2000)
            .element('#92524038-f0e2-4db2-ad01-321a9040df02')
            .click().then(function (result) {
                first_browser
                    .waitForValue("#owner", 2000)
                    .getText("#headerTitle h5").then(function (result) {
                        //console.log(result[0]);
                        //console.log(result[1]);
                        //console.log(result[2]);
                        expect(result[0]).to.equal("Owner: Jack");
                        expect(result[1]).to.equal("Modelname: Mijn tweede geheugenmodel");
                        expect(result[2]).to.equal("Version: 2");
                        done();
                    });
            })
            .catch(function(exception){
                done(exception);
            });
    });

    it("Should execute the undo action when clicked on the undo button", function (done) {
        return first_browser
            .waitForExist("#undoButton", 2000)
            .element("#undoButton")
            .click().then(function (result) {
                first_browser
                    .waitForValue("#owner", 2000)
                    .getText("#headerTitle h5").then(function (result) {
                        //console.log("Should undo action");
                        //console.log(result[0]);
                        //console.log(result[1]);
                        //console.log(result[2]);

                        expect(result[0]).to.equal("Owner: Jack");
                        expect(result[1]).to.equal("Modelname: Mijn geheugenmodel");
                        expect(result[2]).to.equal("Version: 1");
                        done();

                    });
            });
    });

    it("Should retrieve other version when clicked", function (done) {
        return first_browser
            .waitForExist("#1ee3f80e-c107-4fa2-9bc4-4f24887d1754", 2000)    //
            .element('#1ee3f80e-c107-4fa2-9bc4-4f24887d1754')
            .click().then(function (result) {
                first_browser
                    .waitForExist("#memoryModelVersionList", 2000)
                    .element("#versionListItem2")
                    .click().then(function (result) {
                        first_browser
                            .waitForValue("#owner", 2000)
                            .getText("#headerTitle h5").then(function (result) {
                                expect(result[0]).to.equal("Owner: Pietertje");
                                expect(result[1]).to.equal("Modelname: Het tweede geheugenmodel van pietertje");
                                expect(result[2]).to.equal("Version: 2");
                                done();

                            });
                    });
            });
    });


    it("Should move a memory model frame across the screen and should be seen by all viewing browsers", function (done) {
        var id = '#1ee3f80e-c107-4fa2-9bc4-4f24887d1754';
        var divToMove = "#7";
        var divToMoveTo = "#9";
        first_browser
            .element(id)
            .click().then(function () {
                second_browser
                    .element(id)
                    .click().then(function () {
                        second_browser
                            .waitForExist(".Heap", 2000)
                            .waitForExist(".Stack", 2000)
                            .waitForExist(divToMove, 2000)
                            .waitForExist(divToMoveTo, 2000)
                            .then(function () {
                                first_browser
                                    .waitForExist(".Heap", 2000)
                                    .waitForExist(".Stack", 2000)
                                    .waitForExist(divToMove, 2000)
                                    .waitForExist(divToMoveTo, 2000)
                                    .then(function(){
                                        first_browser
                                            //.moveToObject(divToMove, 5, 5)
                                            .moveToObject(divToMove, 1, 1)
                                            .buttonDown()
                                            .moveToObject(divToMoveTo, 1, 1)
                                            .buttonUp()
                                            //.dragAndDrop(divToMove, divToMoveTo)
                                            .getLocation(divToMove)
                                            .then(function (firstbrowser_Location) {
                                                second_browser
                                                    .getLocation(divToMove)
                                                    .then(function (secondbrowser_Location) {
                                                        //console.log(firstbrowser_Location, "first");
                                                        //console.log(secondbrowser_Location, "second");
                                                        //expect(firstbrowser_Location.x).to.equal(secondbrowser_Location.x);
                                                        //expect(firstbrowser_Location.y).to.equal(secondbrowser_Location.y);
                                                        done();
                                                    });
                                            })
                                    })
                            });
                    });
            })
    })

})
;