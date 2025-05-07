const jwt = require('jsonwebtoken');
const connect = require('../db/connection');
require('dotenv').config();

const login = (req, res) => {
    const { id_card, password } = req.body;
    
    // Verificar si los campos necesarios están presentes
    if (!id_card || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Consulta a la base de datos para verificar el usuario
    connect.query('SELECT * FROM users WHERE id_card = ?', [id_card], (err, results) => {
        if (err) {
            console.error('Error en la base de datos (users):', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        const user = results[0];

        // Verificar si el usuario existe y si la contraseña es correcta
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Restringir roles
        if (user.role === 'Admin') {
            return res.status(403).json({ message: 'Este usuario no tiene acceso al sistema' });
        }        

        // Determinar la consulta de información adicional según el rol
        let userInfoQuery;
        if (user.role === 'Patient') userInfoQuery = 'SELECT * FROM patients WHERE id_card = ?';
        else if (user.role === 'Doctor') userInfoQuery = 'SELECT * FROM doctors WHERE id_card = ?';
        else if (user.role === 'Relative') userInfoQuery = 'SELECT * FROM relatives WHERE id_card = ?';
        else return res.status(400).json({ message: 'Rol no válido' });

        // Consulta para obtener información del usuario según su rol
        connect.query(userInfoQuery, [id_card], (err, infoResults) => {
            if (err) {
                console.error('Error en la base de datos (info):', err);
                return res.status(500).json({ message: 'Error al obtener información del usuario' });
            }

            // Verificar si se encontró información del usuario
            if (infoResults.length === 0) {
                return res.status(404).json({ message: 'Información del usuario no encontrada' });
            }

            const info = infoResults[0];

            // Generar el token JWT
            const token = jwt.sign(
                { id_user: user.id_user, role: user.role, email: user.email },
                process.env.JWT_SECRET || 'clave_predeterminada',
                { expiresIn: '1h' }
            );

            // Enviar la respuesta con el token y la información del usuario
            return res.json({
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id_user: user.id_user,
                    name: info.name,
                    email: info.email,
                    role: user.role,
                    id_card: user.id_card,
                    additional_info: info
                }
            });
        });
    });
};

module.exports = { login };
