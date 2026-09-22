const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Authorization header is required.'
    });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Authorization header must use the Bearer token format.'
    });
  }

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.'
    });
  }
}

router.route('/register')
  .post(authController.register);

router.route('/login')
  .post(authController.login);

router.route('/trips')
  .get(tripsController.tripsList)
  .post(authenticateJWT, tripsController.tripsAddTrip);

router.route('/trips/:tripCode')
  .get(tripsController.tripsFindByCode)
  .put(authenticateJWT, tripsController.tripsUpdateTrip)
  .delete(authenticateJWT, tripsController.tripsDeleteTrip);

module.exports = router;