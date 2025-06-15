const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function auth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    console.log('Authorization Header:', authHeader);

    if (!token) {
        return res.status(401).json({ message: 'Token ausente' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token inválido:', err.message);
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};
