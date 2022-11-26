// mysql
const mysql = require('mysql2/promise');

const conLocalP = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "smartsys_monitoring_mach",
    waitForConnections: true,
    connectionLimit: 10,
})

const conTicketP = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "smartsys_ticketing",
    waitForConnections: true,
    connectionLimit: 10,
})

module.exports = { conLocalP, conTicketP }