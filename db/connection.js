const mysql = require('mysql2');

const connect = mysql.createConnection({
    database: 'ing_soft',
    user: 'e9c58j86272ai2bfw2rw',
    host: 'aws.connect.psdb.cloud',
    password: 'pscale_pw_rLQzyFfV9Dwadg7ydmcwKrmKP31m7GRHT6UlUWDUF3M',
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
