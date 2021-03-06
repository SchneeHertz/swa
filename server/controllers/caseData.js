const db = require('../models/caseData')
const us = require('../models/userStore')
const _ = require('lodash')
const jwt = require('jsonwebtoken')


const getCaseData = async (ctx) => {
  let caseNumber = ctx.request.body.caseNumber
  let list = ctx.request.body.list
  if (/^CA\d{12}$/.test(caseNumber) && _.isArray(list)) {
    let result = db.getCaseData(caseNumber, list)
    ctx.body = {
      success: true,
      result: result
    }
  } else {
    ctx.body = {
      success: false,
      info: 'Case号错误'
    }
  }
}

const saveCaseData = async (ctx) => {
  let caseNumber = ctx.request.body.caseNumber
  let data = ctx.request.body.data
  let userData = getUserData(ctx)
  if (/^CA\d{12}$/.test(caseNumber)) {
    db.saveCaseData(caseNumber, data, userData)
    ctx.body = {
      success: true,
      info: '保存成功'
    }
  } else {
    ctx.body = {
      success: false,
      info: 'Case号错误'
    }
  }
}

const getUserData = (ctx) =>{
  let getHeader =_.split(_.get(ctx, 'request.header.authorization'), ' ')[1]
  if (getHeader) {
    return jwt.decode(getHeader)
  }
}

const getUserHistoryCase = async (ctx) => {
  let duration = ctx.request.body.duration
  let userData = getUserData(ctx)
  let result = us.getUserHistoryCase(duration, userData)
  ctx.body = {
    success: true,
    result: result
  }
}

const getUserHistoryCount = async (ctx) => {
  let userData = getUserData(ctx)
  let result = us.getUserHistoryCount(userData)
  ctx.body = {
    success: true,
    result: result
  }
}

module.exports = {
  getCaseData,
  saveCaseData,
  getUserHistoryCase,
  getUserHistoryCount
}