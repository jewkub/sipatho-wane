import { google } from 'googleapis'

export const DateFormat = date => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  year: '2-digit',
  month: 'short',
}).format(new Date(date))

// https://stackoverflow.com/a/74408510
const EMAIL_SENDER = process.env.GMAIL_EMAIL_ADDRESS || 'siisopatho@gmail.com'
const EMAIL_ADMIN = process.env.EMAIL_ADMIN || 'jew.napat@gmail.com'
import MailComposer from 'nodemailer/lib/mail-composer/index.js' // https://stackoverflow.com/a/68621282

function streamToString (stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  })
}

async function sendEmail(auth, query) {
  const gmail = google.gmail({version: 'v1', auth});
  var mail = new MailComposer(messagePayload(query));
  var stream = mail.compile().createReadStream();
  const messageResult = await streamToString(stream)
  const encodedMessage = Buffer
    .from(messageResult)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
  console.log(res.data);
  return res.data;
}

let messagePayload = query => ({
  formSubmit: {
    subject: `มีคำขอแลกเวร ที่ ${query.hospital} จากอาจารย์ ${query.list[0].requestName}`,
    text: 
`สวัสดีค่ะ อาจารย์ ${query.list[0].requestName}
มีคำขอแลกเวรดังนี้

${query.list
  .map((e, i) => `${i+1}. อาจารย์ ${e.requestName}, วันที่ ${DateFormat(e.requestDate)}, subspe ${e.requestSubspe}
ขอแลกกับ
อาจารย์ ${e.responseName}, วันที่ ${DateFormat(e.responseDate)}, subspe ${e.responseSubspe}`)
  .join('\n\n')}

โปรดตรวจสอบข้อมูล หากดำเนินการแลกเรียบร้อยจะส่งอีเมลแจ้งอีกรอบ

ขอบพระคุณมากค่ะ
น้องบอทแลกเวร`,
    to: query.to,
    cc: EMAIL_ADMIN,
    from: EMAIL_SENDER,
    // attachments: [{filename: 'doc.pdf', path: './doc.pdf'}]
  },
  waneSwapped: {
    subject: '',
    text: '',
  }
})[query.template]

export default sendEmail
