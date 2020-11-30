import fs from 'fs';
import ejs from 'ejs';

export const generateActivationCode = () => {
  const numbers = '1234567890';
  let activationCode = '';

  for (let i = 0; i < 5; i++) {
    activationCode += numbers[Math.floor(Math.random() * numbers.length)];
  }

  return activationCode;
};

export const generateVerificationMailContent = (user) => {
  const emailContent = fs.readFileSync('src/mail.ejs', 'utf8');

  const populatedEmailContent = ejs.render(emailContent, {
    userName: user.name,
    activationCode: user.activationCode,
  });

  return populatedEmailContent;
};
