const Lowdb = require('lowdb')
const LodashId = require('lodash-id')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const _ = require('lodash')

_.mixin(LodashId)

const prepareCaseData = (caseNumber)=>{
  const db = Lowdb(new FileSync(path.resolve(__dirname, `../../dbs/caseData/${caseNumber}.json`)))
  db.defaults({
    caseTestitem: {},
    caseCondition: {}
  }).write()
  db._.mixin(LodashId)
  return db
}

const saveCaseData = (caseNumber, data)=>{
  let db = prepareCaseData(caseNumber)
  _.forIn(data, (value, key)=>{
    db.set(key, value).write()
  })
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