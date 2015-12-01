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

    this.timeout(40000);
    var browser;

    before(function (done){
        browser = webdriverio.remote({
            desiredCapabilities: {
                browserName: 'firefox'
            }
        });
        browser.init(done)
    })

    //it('should get homepage', function(done){
    //  browser
    //   .url('https://localhost:3000')
    //    .setValue('#memoryModelWrapper', 'initPlumb')
    //    .click('#memoryModelWrapper')
    //    .initPlumb()
    //    });

    //
    //it('should get homepage', function(done){
    //    browser
    //        .url('http://localhost/api')
    //        .getText(".buzzard h3").then(function(result){
    //            console.log("headline is: ", result);
    //            expect(result).to.be.a("string");
    //            done();
    //        })
    //})
    after(function(done){
        browser.end(done);
    });

});