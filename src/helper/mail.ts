import nodemailer from 'nodemailer';

export const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'dgiverse.tech@gmail.com',
    pass: 'kygo wxtt yfjr ldka',
  },
});

export const mailDetails = {
  from: 'dgiverse.tech@gmail.com',
  to: 'kris@worksbyte.com,muru@worksbyte.com,sanjai@worksbyte.com',
  // to: 'sanjai@worksbyte.com',
  subject: 'New Lead',
  text: `Hi,

  We are pleased to inform you that the status of your lead has been changed.
  
  
  Note:
  This is an auto-generated mail.
   `,
};

export const sendEmail = async (subject: string, text: string) => {
  const mailDetails = {
    from: 'dgiverse.tech@gmail.com',
    to: 'kris@worksbyte.com,muru@worksbyte.com,sanjai@worksbyte.com',
    // to: 'sanjai@worksbyte.com',
    subject,
    text,
  };

  try {
    const info = await gmailTransporter.sendMail(mailDetails);
    console.log('Email sent: ', info.response);
    return { success: true, response: info.response };
  } catch (err) {
    console.error('Error occurred while sending email: ', err);
    return { success: false, error: err };
  }
};

// export const sendMail = {
//   let mailDetails = {
//     from: 'dgiverse.tech@gmail.com',
//     //to: 'kris@worksbyte.com,muru@worksbyte.com,gopal@worksbyte.com,gokulgajapathi@zohomail.in',
//     to: 'gokulgajapathi@zohomail.in',
//     subject: 'New Lead',
//     text: `New lead generation.`,
//     // html: `<html><head><style>h1 {text-align: center;}</style><title>Lead</title></head><body><h1>New Lead Generation on ${currentDate}</h1><br /><h2>Name : ${req.body.name}</h2><h2>Email : ${req.body.business_email}</h2><h2>Phone : ${req.body.mobile}</h2><h2>Company Name : ${req.body.company_name}</h2><br /><br /><h3>Note :</h3><p>This is an auto generated mail</p></body></html>`,
//   };
//   if (result.code !== 422) {
//     gmailTransporter.sendMail(
//       mailDetails,
//       function (err: any, data: any) {
//         if (err) {
//           console.log('Error Occurs: ', err);
//           res
//             .status(statusCode.InternalServer)
//             .json({ status: 0, message: handleCatchError(err) });
//         } else {
//           res.status(result.code).json(result.response);
//         }
//       }
//     );
//   } else {
//     res.status(result.code).json(result.response);
//   }
// };
