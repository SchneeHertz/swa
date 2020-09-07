const Lowdb = require('lowdb')
const LodashId = require('lodash-id')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const _ = require('lodash')

const userStore = Lowdb(new FileSync(path.resolve(__dirname,'../../dbs/userStore.json')))

userStore._.mixin(LodashId)

userStore.defaults({
  history:[]
}).write()

const updateUserHistoryCase = (caseNumber, userData) => {
  let userHistory = userStore.get('history')
    .find({id: userData.id})
    .value()
  if (!userHistory) {
    userStore.get('history')
      .push({
        id: userData.id,
        case: [{
          id: caseNumber,
          date: new Date()
        }]
      })
      .write()
  } else {
    userStore.get('history')
      .find({id: userData.id})
      .get('case')
      .upsert({
        id: caseNumber,
        date: new Date()
      })
      .write()
  }
}

const getUserHistoryCase = (duration, userData) => {
  return userStore.get('history')
    .find({id: userData.id})
    .get('case')
    .filter(c=>new Date() - new Date(c.date) < duration)
    .sortBy('date')
    .value()
}

module.exports = {
  updateUserHistoryCase,
  getUserHistoryCase
}