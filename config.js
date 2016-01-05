module.exports = {
    rethinkdb: {
        host: 'node151.tezzt.nl',
        host: '127.0.0.1',
        port: 28015,
        authKey: '',
        database: "percolatordb",
        tables: ["History", "ModelInfo","Layout"]
    },
    thinky:{
        host:'node151.tezzt.nl',
        host: '127.0.0.1',
        port:28015,
        db: 'percolatordb'
    },
    express: {
        port: 3000
    }
};