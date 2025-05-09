const mysql = require('mysql2');

const connect = mysql.createConnection({
    database: 'ing_soft',
    user: 'ukh5dqdy9y34pfaersiv',
    host: 'aws.connect.psdb.cloud',
    password: 'pscale_pw_W0hXrYbykDrzQUR6RjRKKW6CRUGOmZCqam4JTaepVgB',
    ssl: { rejectUnauthorized: false }
});

connect.connect((err) => {
    if (err) {
        console.error('Error en la conexión a la base de datos:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

module.exports = connect;
