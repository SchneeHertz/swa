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

const updateUserHistoryCase = (caseNumber, data, userData) => {
  let userHistory = userStore.get('history')
    .find({id: userData.id})
    .value()
  let pointCount
  let groupCount
  if (data['methodBaseData']) {
    groupCount = _(data['methodBaseData']).map(m=>m.list).flatten().value().length
  }
  if (data['pointList']) {
    pointCount = data['pointList'].length
  }
  if (!userHistory) {
    userStore.get('history')
      .push({
        id: userData.id,
        case: [{
          id: caseNumber,
          date: new Date(),
          pointCount,
          groupCount
        }]
      })
      .write()
  } else {
    let existCase = userStore.get('history')
      .find({id: userData.id})
      .get('case')
      .find({id: caseNumber})
      .value() || {}
    pointCount = pointCount || existCase.pointCount
    groupCount = groupCount || existCase.groupCount
    userStore.get('history')
      .find({id: userData.id})
      .get('case')
      .upsert({
        id: caseNumber,
        date: new Date(),
        pointCount,
        groupCount
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
    .reverse()
    .value()
}

const getUserHistoryCount = (userData) => {
  let data = userStore.get('history')
    .find({id: userData.id})
    .get('case')
    .value()
  let yearData = _.filter(data, c=>new Date().getFullYear() == new Date(c.date).getFullYear())
  let yearCount = {
    pointCount: _.sum(yearData.map(c=>c.pointCount)),
    groupCount: _.sum(yearData.map(c=>c.groupCount))
  }
  let monthData = _.filter(data, c=>new Date().getMonth() == new Date(c.date).getMonth())
  let monthCount = {
    pointCount: _.sum(monthData.map(c=>c.pointCount)),
    groupCount: _.sum(monthData.map(c=>c.groupCount))
  }
  return {
    yearCount,
    monthCount
  }
}

module.exports = {
  updateUserHistoryCase,
  getUserHistoryCase,
  getUserHistoryCount
}