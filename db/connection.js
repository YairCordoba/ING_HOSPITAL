const mysql = require('mysql2');

const connect = mysql.createConnection({
    database: 'ing_soft',
    user: 'ho0iw0kq2sxtphqq0wwj',
    host: 'aws.connect.psdb.cloud',
    password: 'pscale_pw_MNnppsBZYrFZPDvV73R1uyG2d0ILVW9u53x8p1cGAKF',
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
