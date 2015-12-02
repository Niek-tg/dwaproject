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

describe("E2E test get homepage", function(){

    this.timeout(20000);
    var browser;

    before(function (done){
        browser = webdriverio.remote({
            desiredCapabilities: {
                browserName: 'firefox'
            }
        });
        browser.init(done)
    });


    it("Should read Jack", function(done) {
        browser
            .url("http://localhost:3000")
            .element('#test')
            .click()
    });

    after(function(done){
        browser.end(done);
    });

});