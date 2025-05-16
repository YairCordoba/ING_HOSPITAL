const jwt = require('jsonwebtoken');
const connect = require('../db/connection');
const bcrypt = require('bcrypt');

require('dotenv').config();

const login = (req, res) => {
    const { id_card, password } = req.body;

    if (!id_card || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    connect.query('SELECT * FROM users WHERE id_card = ?', [id_card], (err, results) => {
        if (err) {
            console.error('Error en la base de datos (users):', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        const user = results[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }
        //desencriptado
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).json({ message: 'Error interno del servidor' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            

            let userInfoQuery;
            if (user.role === 'Patient') userInfoQuery = 'SELECT * FROM patients WHERE id_card = ?';
            else if (user.role === 'Doctor') userInfoQuery = 'SELECT * FROM doctors WHERE id_card = ?';
            else if (user.role === 'Relative') userInfoQuery = 'SELECT * FROM relatives WHERE id_card = ?';
            else if (user.role === 'Admin') userInfoQuery = 'SELECT * FROM admins WHERE id_card = ?';
            else return res.status(400).json({ message: 'Rol no válido' });

            connect.query(userInfoQuery, [id_card], (err, infoResults) => {
                if (err) {
                    console.error('Error en la base de datos (info):', err);
                    return res.status(500).json({ message: 'Error al obtener información del usuario' });
                }

                if (infoResults.length === 0) {
                    return res.status(404).json({ message: 'Información del usuario no encontrada' });
                }

                const info = infoResults[0];

                const token = jwt.sign(
                    {
                        id_user: user.id_user,
                        role: user.role,
                        email: user.email
                    },
                    process.env.JWT_SECRET || 'clave_predeterminada',
                    { expiresIn: '1h' }
                );

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
    });
};

module.exports = { login };
