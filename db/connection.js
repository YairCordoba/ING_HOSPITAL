const mysql = require('mysql2');

const connect = mysql.createConnection({
    database: 'ing_soft',
    user: 'pauzubuoscv5bj2zy70t',
    host: 'aws.connect.psdb.cloud',
    password: 'pscale_pw_44ai9DLJbUuA5mE4phofbtOD0v8abLQaaNlD0pVS0wO',
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
