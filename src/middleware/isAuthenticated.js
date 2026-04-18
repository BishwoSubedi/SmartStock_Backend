// const jwt = require("jsonwebtoken");
// const { promisify } = require("util");
// const User = require("../models/User");

// const isAuthenticated = async (req, res, next) => {
//   try {
//  const token=req.cookies.token;

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Please login",
//       });
//     }

//     const decoded = await promisify(jwt.verify)(
//       token,
//       process.env.JWT_SECRET
//     );


//     const doesUserExist = await User.findOne({
//       where: { id: decoded.id },
//     });

//     if (!doesUserExist) {
//       return res.status(404).json({
//         success: false,
//         message: "User does not exist",
//       });
//     }

  
//     req.user = doesUserExist; 

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// };

// module.exports = isAuthenticated;
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const doesUserExist = await User.findOne({
      where: { id: decoded.id },
    });

    if (!doesUserExist) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    req.user = doesUserExist;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = isAuthenticated;