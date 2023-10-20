import 'dotenv/config'
const metadataSheet = process.env.METADATA_SHEET
export const URL_BACKEND = process.env.URL_BACKEND || 'https://sipatho-wane.as.r.appspot.com/'
export const URL_FRONTEND = process.env.URL_FRONTEND || 'https://sipatho-wane.netlify.app/'

export const getEmailList = async sheets => (await sheets.get({
  spreadsheetId: metadataSheet,
  range: 'email!A2:B',
})).data.values.reduce((prev, e) => Object.assign(prev, { [e[0]]: e[1] }), {})

export const getMetadata = async sheets => {
  let raw = (await sheets.get({
    spreadsheetId: metadataSheet,
    range: 'metadata!A2:D',
  })).data.values

  return raw.reduce((prev, e) => Object.assign(prev, { [e[0]]: e[1] }), {
    subspelist: {
      'Surgical S, SG, SP': raw.map(e => e[2]).filter(e => e != null),
      'Surgical SiPH': raw.map(e => e[3]).filter(e => e != null)
    },
  })
}
