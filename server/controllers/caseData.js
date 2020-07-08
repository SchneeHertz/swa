const db = require('../models/caseData')
const _ = require('lodash')


const getCaseData = async (ctx) => {
  let caseNumber = ctx.request.body.caseNumber
  let list = ctx.request.body.list
  if (/^CA\d{12}$/.test(caseNumber) && _.isArray(list)) {
    let result = db.getCaseData(caseNumber, list)
    ctx.body = {
      success: true,
      data: result
    }
  } else {
    ctx.body = {
      success: false,
      info: '参数错误'
    }
  }
}

const saveCaseData = async (ctx) => {
  let caseNumber = ctx.request.body.caseNumber
  let data = ctx.request.body.data
  if (/^CA\d{12}$/.test(caseNumber)) {
    db.saveCaseData(caseNumber, data)
    ctx.body = {
      success: true,
      info: '保存成功'
    }
  } else {
    ctx.body = {
      success: false,
      info: '参数错误'
    }
  }
}

module.exports = {
  getCaseData,
  saveCaseData
}