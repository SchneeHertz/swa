const Lowdb = require('lowdb')
const LodashId = require('lodash-id')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const _ = require('lodash')

const db = Lowdb(new FileSync(path.resolve(__dirname,'../../dbs/data.json')))

db._.mixin(LodashId)
_.mixin(LodashId)

db.defaults({
  materialList: {"material": [], "materialCondition": []},
  methodList: [],
  complexList: [],
  condition: {"single": [], "multiple": [], "afterward": [], "special": []},
  regulation: []
}).write()

const getMaterialList = () => {
  return db.get('materialList').value()
}

const saveMaterialList = (materialList) => {
  let existMaterialList = db.get('materialList').value()
  _.forIn(materialList, (group, type)=>{
    _.forIn(group, material=>{
      switch (material.modify) {
        case 'add':
        case 'modify':
          delete material.modify
          _.upsert(existMaterialList[type], material)
          break
        case 'delete':
          delete material.modify
          _.removeById(existMaterialList[type], material.id)
          break
      }
    })
  })
  db.set('materialList', existMaterialList).write()
}

const getMethodList = () => {
  return db.get('methodList').value()
}

const saveMethodList = (methodList) => {
  let existMethodList = db.get('methodList').value()
  _.forIn(methodList, method=>{
    switch (method.modify) {
      case 'add':
      case 'modify':
        delete method.modify
        _.upsert(existMethodList, method)
        break
      case 'delete':
        delete method.modify
        _.removeById(existMethodList, method.id)
        break
    }
  })
  db.set('methodList', existMethodList).write()
}

const getRegulation = () => {
  return db.get('regulation').value()
}

const getSomeRegulation = (idList) => {
  return db.get('regulation').filter(e=>idList.includes(e.code)).value()
}

const saveRegulation = (regulationList) => {
  let existRegulationList = db.get('regulation').value()
  _.forIn(regulationList, regulation=>{
    switch (regulation.modify) {
      case 'add':
      case 'modify':
        delete regulation.modify
        _.upsert(existRegulationList, regulation)
        break
      case 'delete':
        delete regulation.modify
        _.removeById(existRegulationList, regulation.id)
        break
    }
  })
  db.set('regulation', existRegulationList).write()
}

const getCondition = () => {
  return db.get('condition').value()
}

const saveCondition = (conditionList) => {
  let existConditionList = db.get('condition').value()
  _.forIn(conditionList, (group, cat)=>{
    _.forIn(group, condition=>{
      switch (condition.modify) {
        case 'add':
        case 'modify':
          delete condition.modify
          _.upsert(existConditionList[cat], condition)
          break
        case 'delete':
          delete condition.modify
          _.removeById(existConditionList[cat], condition.id)
          break
      }
    })
  })
  db.set('condition', existConditionList).write()
}

const getComplexList = () => {
  return db.get('complexList').value()
}

const saveComplexList = (complexList) => {
  let existComplexList = db.get('complexList').value()
  _.forIn(complexList, complex=>{
    switch (complex.modify) {
      case 'add':
      case 'modify':
        delete complex.modify
        _.upsert(existComplexList, complex)
        break
      case 'delete':
        delete complex.modify
        _.removeById(existComplexList, complex.id)
        break
    }
  })
  db.set('complexList', existComplexList).write()
}

module.exports = {
  getMaterialList,
  saveMaterialList,
  getMethodList,
  saveMethodList,
  getRegulation,
  getSomeRegulation,
  saveRegulation,
  getCondition,
  saveCondition,
  getComplexList,
  saveComplexList,
}