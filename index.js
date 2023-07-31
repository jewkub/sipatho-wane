#!/usr/bin/env node
// https://stackoverflow.com/a/64383997/4468834
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import 'dotenv/config'

import express from 'express'
const app = express()
const port = process.env.PORT || 8080, ip = process.env.IP || '0.0.0.0'

import { google } from 'googleapis'

import authorize from './auth.js'
import sendEmail, { DateFormat } from './email.js'

app.use(express.urlencoded({ extended: true }))

app.get('/mail', async (req, res) => {
  try {
    const auth = await authorize()
    sendEmail(auth, req.query)
    res.send('done')
  } catch (e) {
    console.error(e)
  }
})

// app.post('/mail', async (req, res) => {
//   try {
//     await sendEmail(auth, req.query)
//   } catch (e) {
//     console.error(e)
//     res.send('[error]')
//   }
// })

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/add', async (req, res) => {
  try {
    const timestamp = new Date().toString()
    const auth = await authorize()
    const sheets = google.sheets({version: 'v4', auth})
    const values = Object.values(req.body)
    const reducedValues = values.reduce((arr, e) => [
      ...arr,
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
    const emailList = (await sheets.spreadsheets.values.get({
      spreadsheetId: '1sAEQ02k3NQdCO9uqdQ1Y3dL30JxTpYPf06KI4493_hc',
      range: 'ทดสอบ!A2:B',
      // majorDimension: 'COLUMNS',
    })).data.values.reduce((prev, e) => Object.assign(prev, { [e[0]]: e[1] }), {})
    // console.log(emailList)

    const result = await sheets.spreadsheets.values.update({
      spreadsheetId: '1VqKnfCXOyuCbAbIOhGghUKUId-ULjPL446JzyM99Uok',
      range: 'รายการแลกเวร!A2:G',
      valueInputOption: 'RAW',
      requestBody: {
        values: reducedValues
      },
    })
    await sendEmail(auth, {
      hospital: 'Surgical S, SG, SP',
      form: 'si',
      to: emailList[values[0].requestName],
      template: 'formSubmit',
      list: values,
    })
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
      spreadsheetId: '1VqKnfCXOyuCbAbIOhGghUKUId-ULjPL446JzyM99Uok',
      range: '20Mar-11Jun!A1:EZ',
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
