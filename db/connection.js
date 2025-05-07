const mysql = require('mysql2');

const connect = mysql.createConnection({
    database: 'ing_soft',
    user: 'chczryd20k7ut2c308lm',
    host: 'aws.connect.psdb.cloud',
    password: 'pscale_pw_5ENFxwmj1lWjZiqqQB9cQ7wF3QPyCFHwTldxnJQe51A',
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
