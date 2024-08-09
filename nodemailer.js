
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({

    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: "dpal991193@gmail.com",
        pass: "pllppeqiqecropyy"
    },


})


const verifyUserEmail = async (email, otp) => {


    const info = await transporter.sendMail({
        from: '"MiniStore" <dpal991193@gmail.com>',
        to: email,
        subject: "Verify Your Email Address - Confirm Your Email",
        html: `
                <p>Dear User,</p>
                <p>Thank you for registering. Please use the OTP below to verify your email address:</p>
                <h3 style="font-size: 24px;">${otp}</h3>
                <p>If you did not request this verification, please disregard this email.</p>
                <p>Best regards,<br/>Your App Team</p>
            `


    });



    console.log("Message sent: %s", info.messageId);




}

module.exports = verifyUserEmail


