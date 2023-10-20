#!/usr/bin/env node
import { URL, fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import qs from 'qs'
import 'dotenv/config'
import express from 'express'
const app = express()
const port = process.env.PORT || 8080, ip = process.env.IP || '0.0.0.0'

import { google } from 'googleapis'
import authorize from './auth.js'
import { sendEmail, DateFormat } from './email.js'
import { getEmailList, getMetadata, URL_BACKEND, URL_FRONTEND } from './init.js'

const auth = await authorize()
const sheets = google.sheets({ version: 'v4', auth }).spreadsheets.values
const metadata = await getMetadata(sheets)
const emailList = await getEmailList(sheets)

app.use(express.urlencoded({ extended: true }))
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  next()
})

app.get('/mail', async (req, res) => {
  try {
    const query = qs.parse(req.query)
    const cc = query.values.map(e => emailList[e.responseName]).concat([
      metadata['Email admin1'],
      metadata['Email admin2'],
    ])
    await sendEmail(auth, {
      hospital: query.hospital,
      to: emailList[query.values[0].requestName],
      template: 'waneSwapped',
      list: query.values,
      from: metadata['Email sender'],
      cc: cc,
    })
    res.send('done')
  } catch (e) {
    console.error(e)
    res.send('[error]')
  }
})

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const sheetAppend = data => sheets.append({
  spreadsheetId: metadata['Form submit'],
  range: data.range,
  valueInputOption: 'USER_ENTERED',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: data.values },
})

app.post('/add', async (req, res) => {
  try {
    if (metadata['Form submit'] === undefined) throw new Error('hospital name error')
    if (metadata['Email sender'] === undefined) throw new Error('sender name not found')
    if (metadata['Email admin1'] === undefined) throw new Error('admin name not found')
    const sender = metadata['Email sender'], admins = [
      metadata['Email admin1'],
      metadata['Email admin2'],
    ]
    const timestamp = new Date().toString()

    if (req.body.hospital === 'Part-time off') {
      await sheetAppend({
        range: 'Part-time off!A2:E',
        values: [[timestamp, req.body.name, req.body.startDate, req.body.endDate, req.body.subspe]]
      })
      await sendEmail(auth, {
        hospital: req.body.hospital,
        to: emailList[req.body.name],
        template: 'part-off',
        name: req.body.name,
        startDate: DateFormat(req.body.startDate),
        endDate: DateFormat(req.body.endDate),
        subspe: req.body.subspe,
        from: sender,
        cc: admins,
      })
    }
    else if (req.body.hospital === 'Frozen office hour') {
      await sheetAppend({
        range: 'Frozen office hour!A2:E',
        values: [[timestamp, req.body.requestName, req.body.date, req.body.group, req.body.responseName]],
      })
      await sendEmail(auth, {
        hospital: req.body.hospital,
        to: emailList[req.body.requestName],
        template: 'frozen-in',
        requestName: req.body.requestName,
        date: DateFormat(req.body.date),
        group: req.body.group,
        responseName: req.body.responseName,
        from: sender,
        cc: admins,
      })
    }
    else if (req.body.hospital === 'Frozen after hour') {
      await sheetAppend({
        range: 'Frozen after hour!A2:E',
        values: [[timestamp, req.body.requestName, req.body.date, req.body.detail]],
      })
      await sendEmail(auth, {
        hospital: req.body.hospital,
        to: emailList[req.body.requestName],
        template: 'frozen-out',
        requestName: req.body.requestName,
        date: DateFormat(req.body.date),
        detail: req.body.detail,
        from: sender,
        cc: admins,
      })
    }
    else if (req.body.hospital === 'Full-time off cytology' || req.body.hospital === 'Full-time off autopsy') {
      await sheetAppend({
        range: `${req.body.hospital}!A2:E`,
        values: [[timestamp, req.body.name, req.body.startDate, req.body.endDate, req.body.details]]
      })
      await sendEmail(auth, {
        hospital: req.body.hospital,
        to: emailList[req.body.name],
        template: 'full-off',
        name: req.body.name,
        startDate: DateFormat(req.body.startDate),
        endDate: DateFormat(req.body.endDate),
        details: req.body.details,
        from: sender,
        cc: admins,
      })
    }
    else if (req.body.hospital === 'Surgical S, SG, SP' || req.body.hospital === 'Surgical SiPH') {
      if (emailList[req.body.values[0].requestName] === undefined) throw new Error('email not found error')
      const reducedValues = req.body.values.reduce((prev, e) => [
        ...prev,
        [
          timestamp,
          e.requestName,
          DateFormat(e.requestDate),
          e.requestSubspe,
          e.responseName,
          DateFormat(e.responseDate),
          e.responseSubspe,
        ]
      ], [])
      const notifyMailUrl = new URL(`/mail?hospital=${req.body.hospital}&${req.body.values
        .map((value, i) =>
          Object
            .keys(value)
            .map(e => `values[${i+1}][${e}]=${value[e]}`)
            .join('&'))
        .join('&')}`, URL_BACKEND).href
      reducedValues[reducedValues.length-1].push(`=HYPERLINK("${notifyMailUrl}", "ส่งเมลแจ้งเตือนแลกเวรสำเร็จ")`)

      await sheetAppend({
        range: `${req.body.hospital}!A2:H`,
        values: reducedValues
      })
      await sendEmail(auth, {
        hospital: req.body.hospital,
        to: emailList[req.body.values[0].requestName],
        template: 'surgical',
        list: req.body.values,
        from: sender,
        cc: admins,
      })
    }
    else throw new Error('hospital unknown')
    res.redirect(new URL('/success', URL_FRONTEND))
  } catch (e) {
    console.error(e)
    res.send('[error]')
  }
})

app.get('/name', async (req, res) => {
  try {
    const date = DateFormat(req.query.date)
    const subspe = req.query.subspe

    const values = (await sheets.get({
      spreadsheetId: metadata[req.query.hospital],
      range: `${metadata[req.query.hospital + ' - sheetname']}!A1:EZ`,
    })).data.values
    const name = values
      ?.filter(col => col?.at(0) == subspe)[0]
      ?.filter((_cell, i) => values[0][i] == date)[0] || 'N/A'
    res.send(name)
  } catch (e) {
    console.error(e)
    res.send('[error]')
  }
})

app.get('/subspelist', async (_req, res) => {
  res.send(metadata.subspelist)
})

app.listen(port, ip, () => console.log('Server running on http://%s:%s', ip, port))
