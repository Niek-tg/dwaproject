module.exports = {
    rethinkdb: {
        host: 'node151.tezzt.nl',
        port: 28015,
        authKey: '',
        database: "percolatordb",
        tables: ["History", "ModelInfo"]
    },
    thinky:{
        host:'node151.tezzt.nl',
        port:28015,
        db: 'percolatordb'
    },
    express: {
        port: 3000
    }
};