const Lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const _ = require('lodash')
const fs = require('fs')

const userStore = require('./userStore')

const prepareCaseData = (caseNumber)=>{
  let dir = `../../dbs/caseData/${caseNumber.slice(0, 9)}`
  if (!fs.existsSync(path.resolve(__dirname, dir))) {
    fs.mkdirSync(path.resolve(__dirname, dir))
  }
  const db = Lowdb(new FileSync(path.resolve(__dirname, dir, `./${caseNumber}.json`)))
  db.defaults({log: []}).write()
  return db
}

const saveCaseData = (caseNumber, data, userData)=>{
  let db = prepareCaseData(caseNumber)
  _.forIn(data, (value, key)=>{
    db.set(key, value).write()
  })
  userStore.updateUserHistoryCase(caseNumber, userData)
  db.get('log').push({
    user: userData.name,
    date: new Date().toLocaleString()
  }).write()
}

const getCaseData = (caseNumber, list)=>{
  let db = prepareCaseData(caseNumber)
  let result = {}
  _.forIn(list, key=>{
    result[key] = db.get(key).value()
  })
  return result
}


module.exports = {
  saveCaseData,
  getCaseData
}