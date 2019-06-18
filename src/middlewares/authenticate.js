import jwt from 'jsonwebtoken';
import models from '../database/models';

const setPublicKey = (nodeEnv) => {
  switch (nodeEnv) {
    case 'test':
      return process.env.JWT_PUBLIC_KEY;
    default: /* istanbul ignore next */
      return process.env.JWT_PUBLIC_KEY;
  }
};

const updateLastLogin = async (req) => {
  const { user: { UserInfo: { email } } } = req;
  await models.User.update({ lastLogin: new Date() }, { where: { email } });
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization
    || req.body.token
    || req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Please provide a token',
    });
  }

  jwt.verify(
    token,
    setPublicKey(process.env.NODE_ENV),
    (error, decodedToken) => {
      if (error) {
        return res.status(401).json({
          success: false,
          error: 'Token is not valid',
        });
      }
      req.userToken = token;
      req.user = decodedToken;
      updateLastLogin(req).then(next).catch(next);
    },
  );
};

export default authenticate;
