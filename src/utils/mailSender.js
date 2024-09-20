import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user:process.env.MAIL_USER ,
    pass: process.env.MAIL_PASS,
    },
});
 async function sendMail(email,title,body) {
    try {
        const info = await transporter.sendMail({
            from:"Form Builder", // sender address
            to:`${email}`, // list of receivers
            subject: `${title}`, // Subject line
            html: `${body}`, // plain text body            
        });

        return info;
    } catch (error) {
        console.error("Error while sending mail",error);
    }
}
  
export {sendMail};