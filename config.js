module.exports = {
    rethinkdb: {
        host: 'localhost',
        port: 28015,
        authKey: '',
        database: "percolatordb",
        tables: ["History", "ModelInfo"]
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