import catchAsync from "../../../utils/catchAsync.js";
import UserInfoModel from "../../../models/UserInfo.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export const createUser = catchAsync(async (req, res, next) => {
  try {
    console.log("hitted");
    const { username, fullname, email, password, role, gender, who } = req.body;
    const findEmail = await UserInfoModel.findOne({ email });
    const findUsername = await UserInfoModel.findOne({ username });
    if (findEmail && findEmail.isVerified === 1) {
      return res.status(422).json({ message: "Email already exists" });
    }
    if (findEmail && findEmail.isVerified === 0) {
      return res.status(422).json({
        message:
          "Your email is not verified, check your gmail and verify it, to login",
      });
    }
    if (findUsername) {
      return res.status(422).json({ message: "Username already exists" });
    }
    if (password.length <= 8) {
      return res
        .status(422)
        .json({ message: "Your password must contains at least 8 letter" });
    }
    if (username.length <= 3 || username.length >= 14) {
      return res.status(422).json({
        message:
          "Your username must contains at least 3 letter and not more than 14 letters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    //send verification mail
    const verificationLink = `${process.env.IP_URL}/api/v1/user/thegreenarea/verify-email/${verificationToken}`;
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "david.kertzmann56@ethereal.email",
        pass: "NUnDcSAyHnAHb8dzSg",
      },
    });

    let mailOptions = {
      from: "khalifaanil84@gmail.com",
      to: email,
      subject: "Verify your email!",
      text: "Verify Email",
      html: `<div style="font-family: Arial, sans-serif; font-size: 16px;">
       <div>
       <span style="color: #44AE26;">
         The Green Area
       </span>
     </div>
       <h2 style="color: #44AE26;">Email Verification</h2>
       <p style="margin-bottom: 20px;">Thank you ${fullname} for signing up! Please verify your email address by clicking the button below:</p>
       <a href="${verificationLink}" style="background-color: #44AE26; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
       <p style="margin-top: 20px;">If the button above doesn't work, you can also verify your email by copying and pasting the following link into your browser:</p>
       <p style="margin-top: 10px;"><a href="${verificationLink}" style="color: #44AE26;"> ${verificationLink} </p>
     </div>`,
    };
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
      } else {
        const signupUser = new UserInfoModel({
          email,
          password: hashedPassword,
          username,
          fullname,
          role,
          who,
          gender,
          verificationToken,
        });
        await signupUser.save();
        res.status(200).json({
          message: "User signed up. Check your email for verification link.",
        });
      }
    });
  } catch (err) {
    throw new Error(err);
  }
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const html = `
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet">
      </head>
        <style>
          body {
            text-align: center;
            padding: 40px 0;
            background: #EBF0F5;
          }
            h1 {
              color: #88B04B;
              font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
              font-weight: 900;
              font-size: 40px;
              margin-bottom: 10px;
            }
            p {
              color: #404F5E;
              font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
              font-size:20px;
              margin: 0;
            }
          i {
            color: #9ABC66;
            font-size: 100px;
            line-height: 200px;
            margin-left:-15px;
          }
          .card {
            background: white;
            padding: 60px;
            border-radius: 4px;
            box-shadow: 0 2px 3px #C8D0D8;
            display: inline-block;
            margin: 0 auto;
          }
        </style>
        <body>
          <div class="card">
          <div style="border-radius:200px; height:200px; width:200px; background: #F8FAF5; margin:0 auto;">
            <i class="checkmark">✓</i>
          </div>
            <h1>SuccessFully verified</h1> 
            <p>Now you can login<br/><a href="http://localhost:3000/login"> Go to login page</a></p>
          </div>
        </body>
    </html>
    `;
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await UserInfoModel.findOneAndUpdate(
      { email: decoded.email, verificationToken: token },
      { isVerified: 1, $unset: { verificationToken: 1 } }
    );

    if (user) {
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } else {
      res.status(400).send("Invalid verification token.");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Invalid verification token.");
  }
});

// login User
export const LoginUser = catchAsync(async (req, res, next) => {
  try {
    console.log("hitted login");
    const { email, password } = req.body;
    const findEmail = await UserInfoModel.findOne({ email });
    if (!findEmail || findEmail == null) {
      res.status(422).json({ message: "Email not found" });
    } else {
      if (findEmail.isVerified === 1) {
        const decryptPass = await bcrypt.compare(password, findEmail.password);
        if (decryptPass) {
          jwt.sign(
            { userId: findEmail._id },
            process.env.SECRET_KEY,
            { expiresIn: 86400 },
            (err, token) => {
              if (err) {
                return res
                  .status(404)
                  .json({ message: "You must login first" });
              }
              const userWithoutPassword = {
                ...findEmail._doc,
                password: undefined,
              };
              res.status(200).json({
                status: "success",
                message: "Successfully, logged in",
                token,
                user: userWithoutPassword,
              });
            }
          );
        } else {
          return res
            .status(422)
            .json({ message: "Email or Password doesn't match" });
        }
      } else {
        res.status(422).json({ message: "Your email is not verified!" });
      }
    }
  } catch (err) {
    throw new Error(err);
  }
});

// verfiy user
export const verifyUser = catchAsync(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!(authHeader && authHeader.toLowerCase().startsWith("bearer")))
      throw createError(
        401,
        "You are not logged in. Please login to get access."
      );
    const token = authHeader.split(" ")[1];
    console.log("verify", token);
    if (!token) {
      return res.sendStatus(401);
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, info) => {
      if (err) {
        return res.sendStatus(401);
      }
      UserInfoModel.findById(info.userId)
        .then((user) => {
          if (!user) {
            return res.sendStatus(401);
          }
          const withOutPassword = {
            ...user._doc,
            password: undefined,
          };
          res.status(200).json({ user: withOutPassword });
        })
        .catch((err) => {
          console.log("Error while finding user:", err);
          res.status(500).json({ message: "Server error" });
        });
    });
  } catch (err) {
    throw new Error(err);
  }
});

//get staff
export const getStaff = catchAsync(async (req, res, next) => {
  try {
    const staffMembers = await UserInfoModel.find({ role: "staff" });
    res.status(200).json(staffMembers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
