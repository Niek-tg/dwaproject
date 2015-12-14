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

describe("E2E test get homepage", function () {

    this.timeout(50000);

    var allBrowsers, masterBrowser, first_browser, second_browser;

    before( function (done) {
        var browserSpecs = {
            master: { desiredCapabilities: {browserName: 'firefox'}},
            first:  { desiredCapabilities: {browserName: 'firefox'}},
            second:  { desiredCapabilities: {browserName: 'firefox'}}
        };

        allBrowsers = webdriverio.multiremote( browserSpecs );
        masterBrowser = allBrowsers.select("master");
        first_browser  = allBrowsers.select("first");
        second_browser = allBrowsers.select("second");

        allBrowsers
            .init()
            .url(siteURL)
            .then(function() {
                done();
            });
    });

    after( function(done) {
        allBrowsers.end(done);
    });


    it("Should retrieve memorymodel information", function (done) {
        return first_browser
            .waitForExist("#92524038-f0e2-4db2-ad01-321a9040df02", 2000)
            .element('#92524038-f0e2-4db2-ad01-321a9040df02')
            .click().then(function (result) {
                first_browser
                    .waitForValue("#owner", 2000)
                    .getText("#headerTitle h5").then(function (result) {
                        console.log(result[0]);
                        console.log(result[1]);
                        console.log(result[2]);
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

    it("Should undo action", function (done) {
        return first_browser
            .waitForExist("#undoButton", 2000)
            .element("#undoButton")
            .click().then(function (result) {
                first_browser
                    .waitForValue("#owner", 2000)
                    .getText("#headerTitle h5").then(function (result) {
                        console.log("Should undo action");
                        console.log(result[0]);
                        console.log(result[1]);
                        console.log(result[2]);

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
                    .waitForExist("#versionListItem2", 2000)
                    .element("#versionListItem2")
                    .click().then(function (result) {
                        browser
                            .waitForValue("#owner", 2000)
                            .getText("#headerTitle h5").then(function (result) {
                                console.log(result[0]);
                                console.log(result[1]);
                                console.log(result[2]);
                                expect(result[0]).to.equal("Owner: Pietertje");
                                expect(result[1]).to.equal("Modelname: Het tweede geheugenmodel van pietertje");
                                expect(result[2]).to.equal("Version: 2");
                                done();

                            });
                    });
            });
    });


})
;