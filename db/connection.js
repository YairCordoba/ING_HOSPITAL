const mysql = require('mysql2');

const connect = mysql.createConnection({
    database: 'ing_soft',
    user: 'd1bxof9w03hwnfi73ou0',
    host: 'aws.connect.psdb.cloud',
    password: 'pscale_pw_K3SE3esMPnoFV0eW8GmiSDrKvEQHiu3auJDBGmqgnri',
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
