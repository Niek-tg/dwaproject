module.exports = {
    rethinkdb: {
        host: 'localhost',
        port: 28015,
        authKey: '',
        database: "percolator",
        tables: ["history", "modelInfo"]
    },
    express: {
        port: 3000
    }
};