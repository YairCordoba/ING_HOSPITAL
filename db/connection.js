const mysql = require('mysql2');

const connect = mysql.createConnection({
    database: 'ing_soft',
    user: 'e5gsrd2396l9vmh70lxc',
    host: 'aws.connect.psdb.cloud',
    password: 'pscale_pw_2fGemXJk4uJtUXBiwjRcxFD6U8GoDu6KIKl12fKgq97',
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
