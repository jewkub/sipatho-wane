import { google } from 'googleapis'

export const DateFormat = date => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  year: '2-digit',
  month: 'short',
}).format(new Date(date))

export const getEmailList = async sheets => (await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.METADATA_SHEET || '1sAEQ02k3NQdCO9uqdQ1Y3dL30JxTpYPf06KI4493_hc',
  range: 'email!A2:B',
})).data.values.reduce((prev, e) => Object.assign(prev, { [e[0]]: e[1] }), {})

export const getSheetId = async sheets => (await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.METADATA_SHEET || '1sAEQ02k3NQdCO9uqdQ1Y3dL30JxTpYPf06KI4493_hc',
  range: 'metadata!A2:B',
})).data.values.reduce((prev, e) => Object.assign(prev, { [e[0]]: e[1] }), {})

// https://stackoverflow.com/a/74408510
const EMAIL_SENDER = process.env.GMAIL_EMAIL_ADDRESS || 'siisopatho@gmail.com'
const EMAIL_ADMIN = process.env.EMAIL_ADMIN || 'panadda.2410@gmail.com'
import MailComposer from 'nodemailer/lib/mail-composer/index.js' // https://stackoverflow.com/a/68621282

function streamToString (stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

async function sendEmail(auth, query) {
  const gmail = google.gmail({version: 'v1', auth})
  let mail = new MailComposer(messagePayload(query))
  let stream = mail.compile().createReadStream()
  const messageResult = await streamToString(stream)
  const encodedMessage = Buffer
    .from(messageResult)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  })
  return res.data
}

let messagePayload = query => {
  switch (query.template) {
    case 'part-off': return {
      subject: `มีคำขอ part-time แจ้ง off เวร`,
      text:
`สวัสดีค่ะ อาจารย์ ${query.name}
มีคำขอ off เวรจากท่าน ในวันที่ ${DateFormat(query.startDate)} ถึงวันที่ ${DateFormat(query.endDate)}
subspe ${query.subspe}

ขอบพระคุณมากค่ะ
น้องบอทแลกเวร`,
      to: query.to,
      cc: EMAIL_ADMIN,
      from: EMAIL_SENDER,
    }

    case 'frozen': return {
      subject: `มีคำขอแลก frozen`,
      text:
`สวัสดีค่ะ อาจารย์ ${query.requestName}
มีคำขอแลกเวร frozen จากอาจารย์ ${query.requestName} ในวันที่ ${DateFormat(query.date)}
กอง frozen ${query.group} แลกกับอาจารย์ ${query.responseName}

ขอบพระคุณมากค่ะ
น้องบอทแลกเวร`,
      to: query.to,
      cc: EMAIL_ADMIN,
      from: EMAIL_SENDER,
    }

    case 'full-off': return {
      subject: `มีคำขอ ${query.hospital}`,
      text:
`สวัสดีค่ะ อาจารย์ ${query.name}
มีคำขอ off เวรจากท่าน ในวันที่ ${DateFormat(query.startDate)} ถึงวันที่ ${DateFormat(query.endDate)}
โดยรายละเอียดคือ ${query.details}

ขอบพระคุณมากค่ะ
น้องบอทแลกเวร`,
      to: query.to,
      cc: EMAIL_ADMIN,
      from: EMAIL_SENDER,
    }

    case 'surgical': return {
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
    }

    case 'waneSwapped': return {
      subject: 'แลกเวรเรียบร้อย',
      text: 
`แลกเวรสำเร็จ ที่ ${query.hospital} ตารางเวรที่เปลี่ยนแปลงเป็นดังนี้

${query.list
  .map((e, i) => `${i+1}. อาจารย์ ${e.responseName} อยู่วันที่ ${DateFormat(e.requestDate)}, subspe ${e.requestSubspe}
อาจารย์ ${e.requestName} อยู่วันที่ ${DateFormat(e.responseDate)}, subspe ${e.responseSubspe}`)
  .join('\n\n')}
`,
      to: query.to,
      cc: EMAIL_ADMIN,
      from: EMAIL_SENDER,
    }
  }
}

export default sendEmail