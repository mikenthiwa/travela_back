import dotenv from 'dotenv';
import switchMessage from './switchMessage';
import switchButtonText from './switchButtonText';

dotenv.config();

const returnButton = (type, redirectLink) => {
  let withRedirect = true;
  if (type === 'Deleted Request'
  || type === 'Send delete email verification'
  || type === 'Reminder') {
    withRedirect = false;
  }
  const button = withRedirect ? `<a
  href="${redirectLink}"
  class="button"
  style="width: 174px;
    border-radius: 4px;
    background-color: #3359DB;
    text-decoration: none;
    color: white;
    font-family: Helvetica; font-size: 17px;
    line-height: 20px; text-align: center;
    display: block; padding: 13px 0;
    margin: 0 auto 73px auto;
    margin-bottom: 73px;"
>
  ${switchButtonText(type)}
</a>` : '';
  return button;
};

const mailTemplate = (
  {
    recipientName,
    senderName,
    type,
    redirectLink,
    requestId,
    comment,
    guesthouseName,
    checkInTime,
    durationOfStay,
    destination,
    checkoutTime,
    details,
    picture
  }
) => (
  `
  <div
    style="background-color: #ececec;
      display: grid;
      grid-template-columns: 1fr;
      grid-gap: 1px;
      margin: 0;
      padding-top: 80px;
      font-weight: 100;
      text-align: center;">
      <div style="height: max-content;
      background-color: #FFFFFF;
      width: 610px;
      border: 1px solid #F5F5F5;
      margin: 0 auto;"
    >
    <style>
    @font-face {
    font-family: DINPro;
    src: url(https://res.cloudinary.com/travela-andela/raw/upload/v1545298182/staging/FontFont_-_DINPro.otf);
    }
    * {
    font-family: DINPro;
    }
    </style>
    <div
      style="color: green;
        font-size: 27px;
        font-weight: bold;
        margin-top: 91.15px;
        display: flex;
        justify-content: center;"
    >
      <img
        src="https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png"
        style="display: block; width: 140px; margin: 0 auto; height: 40px;"
      >
    </div>
    <h2
      style="font-weight: 500;
      margin-top: 40px;
      margin-bottom: 30px;
      color: #333E44;"
    >
      <b>Hi ${recipientName || '%recipient.name%!'}!</b>
    </h2>
    <p
      style="width: 406px;
        display: block;
        margin-left: auto;
        font-size: 16px;
        line-height: 21px;
        color: #4F4F4F;
        margin: 0 auto 50px auto;"
    >
      ${switchMessage({
    type,
    senderName,
    recipientName,
    requestId,
    comment,
    guesthouseName,
    checkInTime,
    durationOfStay,
    destination,
    checkoutTime,
    details,
    picture
  })}
    </p>
    ${returnButton(type, redirectLink)}
  </div>
  <div
    style="box-sizing: border-box;
      height: 2px; width: 610px;
      border: 1px solid #D4D4D4;
      margin: 0 auto;"
  >
  </div>
  <div
    style="height: 130px;
      border-radius: 0 0 4px 4px; width: 610px;
      background-color: #FFFFFF;
      border: 1px solid #F5F5F5;
      margin: 0 auto 145px auto;"
  >
    <div
      style="color: #000000; font-family: "DIN Pro";
        font-size: 16px; line-height: 100%;
        height: 100%;"
    >
      <p style="margin: 40px 0 10px 0;
        color: #4F4F4F;"
      >
        Have a question?
      </p>
      <a href=${process.env.REDIRECT_URL} style="color: #3359DB;">
        support@travela.com
      </a>
    </div>
  </div>
  </div>
  `
);

export default mailTemplate;
