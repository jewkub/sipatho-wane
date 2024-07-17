import { google } from 'googleapis'

export const DateFormat = date => [
  new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
  }).format(new Date(date)),
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
  }).format(new Date(date)),
  new Intl.DateTimeFormat('en-US', {
    year: '2-digit',
  }).format(new Date(date)),
].join(' ')

// https://stackoverflow.com/a/74408510
import MailComposer from 'nodemailer/lib/mail-composer/index.js' // https://stackoverflow.com/a/68621282

function streamToString (stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

export async function sendEmail(auth, query) {
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
  let output
  if (query.template == 'part-off') output = {
    subject: `มีคำขอ part-time แจ้ง off เวร`,
    text:
`สวัสดีค่ะ อาจารย์ ${query.name}
มีคำขอ off เวรจากท่าน ในวันที่ ${DateFormat(query.startDate)} ถึงวันที่ ${DateFormat(query.endDate)}
subspe ${query.subspe}`,
  }

  else if (query.template == 'frozen-in') output = {
    subject: `มีคำขอแลกเวร frozen ในเวลา`,
    text:
`สวัสดีค่ะ อาจารย์ ${query.list[0].requestName}
มีคำขอแลกเวร frozen ดังนี้

${query.list
.map((e, i) => `${i+1}. อาจารย์ ${e.requestName}, วันที่ ${DateFormat(e.requestDate)}
กอง ${e.group} ขอแลกกับ
อาจารย์ ${e.responseName}, วันที่ ${DateFormat(e.responseDate)}`)
.join('\n\n')}

โปรดตรวจสอบข้อมูล หากดำเนินการแลกเรียบร้อยจะส่งอีเมลแจ้งอีกรอบ`,
  }

  else if (query.template == 'frozen-out') output = {
    subject: `มีคำขอแลกเวร frozen นอกเวลา`,
    text:
`สวัสดีค่ะ อาจารย์ ${query.requestName}
มีคำขอแลกเวร frozen จากอาจารย์ ${query.requestName} ในวันที่ ${DateFormat(query.date)}
รายละเอียดเพิ่มเติมดังนี้
${query.detail}`,
  }

  else if (query.template == 'full-off') output = {
    subject: `มีคำขอแลกเวร ${query.hospital}`,
    text:
`สวัสดีค่ะ อาจารย์ ${query.name}
มีคำขอ off เวรจากท่าน ในวันที่ ${DateFormat(query.startDate)} ถึงวันที่ ${DateFormat(query.endDate)}
โดยรายละเอียดคือ ${query.details}`,
  }
  
  else if (query.template == 'surgical') output = {
    subject: `มีคำขอแลกเวร ที่ ${query.hospital} จากอาจารย์ ${query.list[0].requestName}`,
    text: 
`สวัสดีค่ะ อาจารย์ ${query.list[0].requestName}
มีคำขอแลกเวรดังนี้

${query.list
  .map((e, i) => `${i+1}. อาจารย์ ${e.requestName}, วันที่ ${DateFormat(e.requestDate)}, subspe ${e.requestSubspe}
ขอแลกกับ
อาจารย์ ${e.responseName}, วันที่ ${DateFormat(e.responseDate)}, subspe ${e.responseSubspe}`)
  .join('\n\n')}

โปรดตรวจสอบข้อมูล หากดำเนินการแลกเรียบร้อยจะส่งอีเมลแจ้งอีกรอบ`,
  }

  else if (query.template == 'wane-swapped') output = {
    subject: 'แลกเวรเรียบร้อย',
    text: 
`แลกเวรสำเร็จ ที่ ${query.hospital} รายการเวรที่เปลี่ยนแปลงเป็นดังนี้

${query.list
  .map((e, i) => `${i+1}. subspe ${e.requestSubspe}
อาจารย์ ${e.responseName} อยู่วันที่ ${DateFormat(e.requestDate)}
อาจารย์ ${e.requestName} อยู่วันที่ ${DateFormat(e.responseDate)}`)
  .join('\n\n')}`,
  }

  else if (query.template == 'frozen-swapped') output = {
    subject: 'แลกเวรเรียบร้อย',
    text:
`แลกเวรสำเร็จ ที่ ${query.hospital} รายการเวรที่เปลี่ยนแปลงเป็นดังนี้

${query.list
  .map((e, i) => `${i+1}. กอง ${e.group}
อาจารย์ ${e.responseName} อยู่วันที่ ${DateFormat(e.requestDate)}
อาจารย์ ${e.requestName} อยู่วันที่ ${DateFormat(e.responseDate)}`)
  .join('\n\n')}`,
  }

  const signature = `\n\nขอบพระคุณมากค่ะ\nน้องบอทแลกเวร`

  output.text += signature
  return Object.assign(output, {
    to: query.to,
    cc: query.cc,
    from: query.from,
  })
}
