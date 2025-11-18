const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai o token do "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  jwt.verify(token, 'seu_segredo_aqui', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.user = user; // Adiciona o usuário decodificado à requisição
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  if (req.user && req.user.tipo_usuario === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado: apenas administradores podem realizar esta ação' });
  }
};

module.exports = { authenticateToken, authenticateAdmin };