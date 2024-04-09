const nodemailer = require("nodemailer");

exports.sendMail = async (email, subject, body) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    //   host: "smtp.ethereal.email",
    //   port: 587,
    //   secure: false,
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html: body,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(Error("Error sending email"));
      }
      console.log("Email Send", info);
      resolve("Password reset OTP send to your email");
    });
  });
};
