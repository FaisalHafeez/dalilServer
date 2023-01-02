// importing users collection
const user = require(`../schemas/userSchema`);
// importing  dependencies
const bcrypt = require("bcrypt");
const jwt = require(`jsonwebtoken`);

const Login = async (req, res) => {
  try {
    const myPlaintextPassword = req.body.password;

    const doc = await user.findOne({
      username: req.body.username,
    });
    if (!doc) {
      return res.status(404).json({ msg: `username is invalid` });
    }
    const hashedPassword = doc.password;
    const userId = doc.userId;
    // comparing hashed password
    const hash = await bcrypt.compare(myPlaintextPassword, hashedPassword);
    if (!hash) {
      return res.status(404).json({ msg: `password is invalid` });
    }
    const { username } = req.body;
    const document = await user.findOne({
      password: hashedPassword,
      username: username,
    });

    const token = jwt.sign(
      { userId, username, hashedPassword },
      process.env.jwtSecret,
      {
        expiresIn: `30d`,
      }
    );
    res.cookie("access_token", `Bearer ${token}`, {
      expires: new Date(Date.now() + 720 * 3600000),
      httpOnly: true,
      path: `/`,
    });
    const response = await user
      .aggregate([
        {
          $match: {
            username: username,
            password: hashedPassword,
          },
        },
        {
          $lookup: {
            from: `beneficiaries`,
            localField: `userId`,
            foreignField: `userId`,
            as: `beneficiary`,
          },
        },
        {$unwind: '$beneficiary'},
        {$project: { 
          __v: 0,
          sd: 0,
          _id: 0,
          password: 0,
          "beneficiary._id": 0,
          "beneficiary.__v": 0,
          "beneficiary.sd": 0
        }},
        
        
      ])
      .exec();
    
    const responseBody = {
      statusCode: "200",
      message: "good",
      token: `Bearer ${token}`,
      data: response[0]
    }

    res.status(200).json({...responseBody });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = Login;
