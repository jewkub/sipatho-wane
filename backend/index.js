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
import sendEmail, { DateFormat, getEmailList, getSheetId } from './email.js'

const HOME_URL = process.env.HOME_URL || 'https://sipatho-wane.as.r.appspot.com/'

const auth = await authorize()
const sheetId = await getSheetId(google.sheets({ version: 'v4', auth }))

app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  next()
})

app.get('/mail', async (req, res) => {
  try {
    const auth = await authorize()
    const sheets = google.sheets({ version: 'v4', auth })
    const query = qs.parse(req.query)
    // console.log(query.values)

    const emailList = await getEmailList(sheets)

    await sendEmail(auth, {
      hospital: query.hospital,
      to: emailList[query.values[0].requestName],
      template: 'waneSwapped',
      list: query.values,
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

app.post('/add', async (req, res) => {
  console.log(req.body)
  try {
    const timestamp = new Date().toString()
    const auth = await authorize()
    const sheets = google.sheets({ version: 'v4', auth })
    if (sheetId['Form submit'] === undefined) throw new Error('hospital name error')
    const emailList = await getEmailList(sheets)

    const sheetAppend = data => sheets.spreadsheets.values.append({
      spreadsheetId: sheetId['Form submit'],
      range: data.range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: data.values
      },
    })

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
      })
    }
    else if (req.body.hospital === 'Frozen') {
      // const notifyMailUrl = new URL(`/mail?hospital=${req.body.hospital}&requestName=${req.body.requestName}&date=${req.body.date}&group=${req.body.group}&responseName=${req.body.responseName}`, HOME_URL).href
      await sheetAppend({
        range: 'Frozen!A2:E',
        values: [[timestamp, req.body.requestName, req.body.date, req.body.group, req.body.responseName]]
      })
      await sendEmail(auth, {
        hospital: req.body.hospital,
        to: emailList[req.body.requestName],
        template: 'frozen',
        requestName: req.body.requestName,
        date: DateFormat(req.body.date),
        group: req.body.group,
        responseName: req.body.responseName,
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
        .join('&')}`, HOME_URL).href
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
      })
    }
    else throw new Error('hospital unknown')
    res.send('success')
  } catch (e) {
    console.error(e)
    res.send('[error]')
  }
})

app.get('/name', async (req, res) => {
  try {
    const date = DateFormat(req.query.date)
    const subspe = req.query.subspe

    const auth = await authorize()
    const sheets = google.sheets({version: 'v4', auth})
    const values = (await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId[req.query.hospital],
      range: '12Jun-3Sep!A1:EZ',
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

app.listen(port, ip, () => console.log('Server running on http://%s:%s', ip, port))
