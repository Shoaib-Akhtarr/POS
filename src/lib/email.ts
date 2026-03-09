import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTPEmail = async (email: string, otp: string) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('EMAIL_USER or EMAIL_PASS environment variables are missing.');
        return false;
    }

    const mailOptions = {
        from: `"Karobar Sahulat" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code - Karobar Sahulat',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5; text-align: center; font-weight: 800;">Karobar Sahulat</h2>
                <p style="font-size: 16px; color: #1e293b;">Hello,</p>
                <p style="font-size: 16px; color: #1e293b;">Your verification code for creating an account is:</p>
                <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 32px; font-weight: 900; color: #4f46e5; letter-spacing: 5px; margin: 20px 0; border-radius: 12px;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #64748b;">This code will expire in 10 minutes. Please enter it within 1 minute for the best experience.</p>
                <p style="font-size: 14px; color: #64748b;">If you didn't request this code, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Karobar Sahulat. All rights reserved.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error: any) {
        console.error('Nodemailer Error:', error.message);
        return false;
    }
};
