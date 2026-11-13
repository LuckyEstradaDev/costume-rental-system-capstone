import nodemailer from 'nodemailer';
import type { IOTPVerification } from '../interfaces/IOTPVerification.js';
import { OTP_EXPIRY_MINUTES } from '../config/otp.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

type OTPPurpose = IOTPVerification['purpose'];

// Copy mirrors the OTP step on the website so the email feels like the same flow.
const EMAIL_COPY: Record<OTPPurpose, {
    subject: string;
    heading: string;
    description: (email: string) => string;
}> = {
    ACCOUNT_VERIFICATION: {
        subject: 'Your Morena verification code',
        heading: 'Verify your email',
        description: (email) => `Enter the 6-digit code sent to ${email}.`,
    },
    PASSWORD_RESET: {
        subject: 'Your Morena password reset code',
        heading: 'Reset your password',
        description: (email) => `Enter the 6-digit code sent to ${email} to reset your password.`,
    },
    EMAIL_CHANGE: {
        subject: 'Confirm your new Morena email',
        heading: 'Confirm your new email',
        description: (email) => `Enter the 6-digit code sent to ${email} to confirm this address.`,
    },
};

const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);

const FONT = "Arial, Helvetica, sans-serif";

interface OTPEmailContent {
    otp: string;
    email: string;
    name?: string | undefined;
    purpose: OTPPurpose;
}

const buildOTPEmail = ({ otp, email, name, purpose }: OTPEmailContent) => {
    const copy = EMAIL_COPY[purpose];
    const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi there,';
    const safeEmail = escapeHtml(email);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${copy.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;">
<tr>
<td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background-color:#ffffff;border:1px solid #e6e7eb;border-radius:8px;">
<tr>
<td style="padding:24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td width="24" height="24" style="width:24px;height:24px;background-color:#703c8e;border-radius:12px;font-size:0;line-height:0;">&nbsp;</td>
<td style="padding-left:8px;font-family:${FONT};font-size:18px;font-weight:700;line-height:24px;color:#703c8e;">Morena</td>
</tr>
</table>
<h1 style="margin:16px 0 0;font-family:${FONT};font-size:24px;line-height:32px;font-weight:700;letter-spacing:-0.5px;color:#05081b;">${copy.heading}</h1>
<p style="margin:8px 0 0;font-family:${FONT};font-size:14px;line-height:22px;color:#737373;">${greeting}<br />${copy.description(safeEmail)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:16px auto 0;">
<tr>
<td align="center" style="background-color:#f5f5f5;border:1px solid #e6e7eb;border-radius:8px;padding:12px 18px 12px 24px;font-family:${FONT};font-size:30px;font-weight:700;line-height:36px;letter-spacing:8px;color:#05081b;text-align:center;white-space:nowrap;">${otp}</td>
</tr>
</table>
<p style="margin:8px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#737373;text-align:center;">Select and copy the verification code above.</p>
<p style="margin:8px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#737373;text-align:center;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
<hr style="border:none;border-top:1px solid #e6e7eb;margin:16px 0 0;" />
<p style="margin:12px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#737373;text-align:center;">If you didn't request this code, you can safely ignore this email.</p>
</td>
</tr>
</table>
<p style="margin:12px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#737373;text-align:center;">Morena Gowns and Barongs</p>
</td>
</tr>
</table>
</body>
</html>`;

    const text = [
        copy.heading,
        '',
        greeting,
        copy.description(email),
        '',
        `Your code: ${otp}`,
        '',
        'Select and copy the verification code above.',
        '',
        `This code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        "If you didn't request this code, you can safely ignore this email.",
        '',
        'Morena Gowns and Barongs',
    ].join('\n');

    return { subject: copy.subject, html, text };
};

export interface SendOTPEmailParams {
    to: string;
    otp: string;
    name?: string | undefined;
    purpose?: OTPPurpose;
}

export const sendOTPEmail = async ({
    to,
    otp,
    name,
    purpose = 'ACCOUNT_VERIFICATION',
}: SendOTPEmailParams) => {
    const { subject, html, text } = buildOTPEmail({ otp, email: to, name, purpose });

    await transporter.sendMail({
        from: `"Morena Gowns and Barongs" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    });
};
