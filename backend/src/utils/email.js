import nodemailer from 'nodemailer';

export async function sendInviteEmail({ email, name, token }) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const inviteLink = `${clientUrl}/accept-invite/${token}`;

  const messageText = `Hi ${name},

Your doctor has created your ACL Rehab Pro dashboard.

Click here to activate your account:
${inviteLink}

Set your password and start tracking your rehab.`;

  console.log('\n=========================================');
  console.log(`INVITATION LINK FOR PATIENT ${name} (${email}):`);
  console.log(inviteLink);
  console.log('=========================================\n');

  try {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    if (!hasSmtpConfig) {
      console.log('SMTP settings not fully configured in .env. Invitation printed to console only.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ACL Rehab Pro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to ACL Rehab Pro - Set Your Password',
      text: messageText,
      html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2563eb;">Welcome to ACL Rehab Pro</h2>
        <p>Hi ${name},</p>
        <p>Your doctor has created your ACL rehabilitation tracking profile.</p>
        <p style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Activate Your Account</a>
        </p>
        <p>Alternatively, copy and paste this link into your browser:</p>
        <p><a href="${inviteLink}">${inviteLink}</a></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #64748b;">This invitation expires in 24 hours. If you did not expect this, please ignore this email.</p>
      </div>`
    });

    console.log(`Invite email successfully sent to ${email}`);
  } catch (error) {
    console.error('Error sending invitation email:', error);
  }
}

export async function sendRiskAlertEmail({ doctorEmail, doctorName, patientName, reportedSymptoms }) {
  const messageText = `Urgent clinical alert for Dr. ${doctorName}:
Your patient, ${patientName}, has logged high-risk recovery metrics or warning complications:
${reportedSymptoms}

Please check the ACL Rehab Pro dashboard immediately.`;

  console.log('\n=========================================');
  console.log(`EMERGENCY ALERT FOR CLINICIAN Dr. ${doctorName} (${doctorEmail}):`);
  console.log(`Patient ${patientName} symptoms: ${reportedSymptoms}`);
  console.log('=========================================\n');

  try {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    if (!hasSmtpConfig) {
      console.log('SMTP settings not fully configured. Alert warning printed to console.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ACL Rehab Pro Alerts" <${process.env.SMTP_USER}>`,
      to: doctorEmail,
      subject: `URGENT ALERT: High Risk reported by patient ${patientName}`,
      text: messageText,
      html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6; border-left: 4px solid #cc001f;">
        <h2 style="color: #cc001f;">Urgent Clinical Alert</h2>
        <p>Hi Dr. ${doctorName},</p>
        <p>Your managed patient <strong>${patientName}</strong> has logged metrics that triggered the automated ACL clinical gatekeeper warning system.</p>
        <p style="background-color: #fcf1f2; color: #9e0a0a; padding: 15px; border-radius: 8px; font-weight: bold; border: 1px solid #f8d7da;">
          Triggered Warnings: ${reportedSymptoms}
        </p>
        <p>Please check their clinical profile logs immediately to determine if therapy protocols need adjustment.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 11px; color: #64748b;">This email was sent automatically because your patient logged symptoms satisfying the clinical Red Flags thresholds.</p>
      </div>`
    });

    console.log(`Clinical warning alert successfully emailed to ${doctorEmail}`);
  } catch (error) {
    console.error('Error sending clinical alert email:', error);
  }
}
