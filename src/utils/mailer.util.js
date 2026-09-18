// import nodemailer from 'nodemailer';

// const sendMail = async (email, subject, template) => {
//     try {
//         console.log("Sending email to:", email, "with subject:", subject);
//         const config = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.SENDER_EMAIL,
//                 pass: process.env.SENDER_PASSWORD
//             }
//         });

//         const mailOptions = {
//             from: process.env.SENDER_EMAIL,
//             to: email,
//             subject: subject,
//             html: template
//         };

//         await config.sendMail(mailOptions);
//         return true;
//     } catch (error) {
//         console.log("Detailed email error code/msg:", error.code, error.message, error.stack);
//         return false;
//     }
// }

// export default sendMail;

import nodemailer from 'nodemailer';

const sendMail = async (email, subject, template) => {
    try {
        const config = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_PASSWORD
            }
        });

        await config.sendMail({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: subject,
            html: template
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message, code: error.code };
    }
}

export default sendMail;