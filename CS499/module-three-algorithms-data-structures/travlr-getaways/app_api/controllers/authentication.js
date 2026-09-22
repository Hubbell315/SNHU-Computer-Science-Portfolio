const User = require('../models/user');
const passport = require('passport');

// create a new admin user and return a jwt
const register = async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  // make sure required account data was sent
  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'name email and password are required'
    });
  }

  // basic password requirement before making a hash
  if (password.length < 8) {
    return res.status(400).json({
      message: 'password must be at least 8 characters long'
    });
  }

  try {
    const user = new User({
      name,
      email
    });

    // hash the password before saving it to mongodb
    user.setPassword(password);
    await user.save();

    return res.status(201).json({
      token: user.generateJWT()
    });
  } catch (error) {
    // duplicate email from the unique mongoose field
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'an account with that email already exists'
      });
    }

    // return model validation failures without exposing database details
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: 'unable to create the account'
    });
  }
};

// verify a users login and return a jwt if it is valid
const login = (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'email and password are required'
    });
  }

  // use the cleaned email value during passport authentication
  req.body.email = email;

  passport.authenticate('local', (error, user, info) => {
    if (error) {
      return res.status(500).json({
        message: 'authentication could not be completed'
      });
    }

    if (!user) {
      return res.status(401).json({
        message: info?.message || 'invalid email or password'
      });
    }

    return res.status(200).json({
      token: user.generateJWT()
    });
  })(req, res);
};

module.exports = {
  register,
  login
};