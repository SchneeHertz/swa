const Lowdb = require('lowdb')
const LodashId = require('lodash-id')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const _ = require('lodash')

const db = Lowdb(new FileSync(path.resolve(__dirname,'../../dbs/data.json')))

db._.mixin(LodashId)
_.mixin(LodashId)

db.defaults({
  materialList: []
}).write()

const getMaterialList = () => {
  return db.get('materialList').value()
}

// const saveRegulation = (regulationList) => {
//   let existRegulationList = db.get('regulation').value()
//   _.forIn(regulationList, regulation=>{
//     switch (regulation.modify) {
//       case 'add':
//       case 'modify':
//         delete regulation.modify
//         _.upsert(existRegulationList, regulation)
//         break
//       case 'delete':
//         delete regulation.modify
//         _.removeById(existRegulationList, regulation.id)
//         break
//     }
//   })
//   db.set('regulation', existRegulationList).write()
// }

// const getCondition = () => {
//   return db.get('condition').value()
// }

// const saveCondition = (conditionList) => {
//   let existConditionList = db.get('condition').value()
//   _.forIn(conditionList, (group, cat)=>{
//     _.forIn(group, condition=>{
//       switch (condition.modify) {
//         case 'add':
//         case 'modify':
//           delete condition.modify
//           _.upsert(existConditionList[cat], condition)
//           break
//         case 'delete':
//           delete condition.modify
//           _.removeById(existConditionList[cat], condition.id)
//           break
//       }
//     })
//   })
//   db.set('condition', existConditionList).write()
// }

// const getInfoList = () => {
//   return db.get('infoList').value()
// }

// const saveInfoList = (infoList) => {
//   db.set('infoList', infoList).write()
// }

module.exports = {
  getMaterialList,
  // saveRegulation,
  // getCondition,
  // saveCondition,
  // getInfoList,
  // saveInfoList
}