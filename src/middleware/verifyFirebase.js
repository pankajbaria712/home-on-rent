const admin = require('../firebase');

async function verifyFirebase(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(idToken);
      req.user = decoded;
      return next();
    }
    return res.status(401).json({ message: 'No token provided' });
  } catch (err) {
    console.error('Token verify error', err);
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
}

module.exports = verifyFirebase;
