/*
 * E2E User story 1
 * */
//
//var webdriverio = require('webdriverio');
//var expect = require('chai').expect;


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

describe("E2E test get homepage", function () {

    this.timeout(20000);
    var browser;

    before(function (done) {
        browser = webdriverio.remote({
            desiredCapabilities: {
                browserName: 'chrome'
            }
        });
        browser.init(done)
    });


    it("Should retrieve memorymodel information", function (done) {
        browser
            .url("http://localhost:3000")
            .waitForExist("#92524038-f0e2-4db2-ad01-321a9040df02", 2000)
            .element('#92524038-f0e2-4db2-ad01-321a9040df02')
            .click().then(function (result) {
                browser
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
            });
    });

    it("Should undo action", function (done) {
        browser
            .waitForExist("#undoButton", 2000)
            .element("#undoButton")
            .click().then(function (result) {
                browser
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

    after(function (done) {
        browser.end(done);
    });

})
;