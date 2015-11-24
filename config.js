/**
 * Created by dickpino on 24-11-15.
 */
module.exports = {
    rethinkdb: {
        host: 'localhost',
        port: 28015,
        authKey: '',
        database: "percolatordb",
        tables: ["history", "modelInfo"]
    },
    thinky:{
        //host: 'server8.tezzt.nl'
        host:'localhost',
        port:28015,
        db: 'percolatordb'
    },
    express: {
        port: 3000
    }
};