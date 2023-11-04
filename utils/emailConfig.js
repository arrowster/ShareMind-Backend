import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendEmail = async (sendEmail) => {
    const generateRandom = (min, max) => {
        const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
        return ranNum;
    };

    const number = generateRandom(111111, 999999);

    const mailOptions = {
        from: 'ShareMind',
        to: sendEmail,
        subject: '[ShareMind]인증 관련 이메일 입니다',
        text: `오른쪽 숫자 6자리를 입력해주세요: ${number}`,
    };

    try {
        await smtpTransport.sendMail(mailOptions);
        // 이메일 전송 성공 시 반환할 데이터 처리
        return { success: true, number };
    } catch (error) {
        // 이메일 전송 실패 시 반환할 데이터 처리
        return { success: false, error };
    }
};

export default {
    sendEmail
}

