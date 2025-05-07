const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: 'Token no proporcionado.' });

    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'mi_clave_secreta', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token inválido o expirado.' });
        req.user = decoded;
        next();
    });
};

module.exports = jwtMiddleware;