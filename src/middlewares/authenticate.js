import jwt from 'jsonwebtoken';
import SimpleCrypto from 'simple-crypto-js';
import models from '../database/models';
import UserHelper from '../helpers/user';

const simpleCrypto = new SimpleCrypto(process.env.JWT_PUBLIC_KEY);

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


export const authenticateEmailApproval = async (req, res, next) => {
  const { body: { approvalToken = '' } } = req;
  const email = simpleCrypto.decrypt(decodeURIComponent(approvalToken));
  const user = await models.User.findOne({ where: { email } });
  req.headers.authorization = user ? await UserHelper.setToken(user) : req.headers.authorization;
  return next();
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
