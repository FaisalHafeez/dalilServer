const jwt = require(`jsonwebtoken`);

const authentication = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ msg: `Not Authorized` });
  }
  const auth = req.headers.authorization;
  const payload = jwt.verify(auth.split(` `)[1], process.env.jwtSecret);
  res.locals.id = payload._id;
  if (!auth.startsWith(`Bearer `) || !payload) {
    return res.status(401).json({ msg: `Authorization credentials not valid` });
  }
  next();
};

const cookieVerification = (req, res, next) => {
  const { access_token } = req.cookies;
  if (!access_token) {
    return res.status(401).json({ msg: `No Authorization` });
  }
  const payload = jwt.verify(access_token.split(` `)[1], process.env.jwtSecret);
  if (!access_token.startsWith(`Bearer `)) {
    return res.status(401).json({ msg: `Authorization credentials not valid` });
  }
  res.locals.user = payload;
  next();
};

module.exports = { authentication, cookieVerification };
