const db = require('../models/generalData')
const ur = require('../models/user')
const _ = require('lodash')
const jwt = require('jsonwebtoken')

const getMaterialList = async (ctx) => {
  ctx.body = {
    success: true,
    materialList: db.getMaterialList()
  }
}

const saveMaterialList = async (ctx) => {
  if (isAdmin(ctx)) {
    const materialList = ctx.request.body.materialList
    db.saveMaterialList(materialList)
    ctx.body = {
      success: true,
      info: '保存成功'
    }
  } else  {
    ctx.body = {
      success: false,
      info: '无操作权限'
    }
  }
}

const getMethodList = async (ctx) => {
  ctx.body = {
    success: true,
    methodList: db.getMethodList()
  }
}

const saveMethodList = async (ctx) => {
  if (isAdmin(ctx)) {
    const methodList = ctx.request.body.methodList
    db.saveMethodList(methodList)
    ctx.body = {
      success: true,
      info: '保存成功'
    }
  } else  {
    ctx.body = {
      success: false,
      info: '无操作权限'
    }
  }
}

const getRegulation = async (ctx) => {
  ctx.body = {
    success: true,
    regulationList: db.getRegulation()
  }
}

const getSomeRegulation = async (ctx) => {
  let idList = ctx.request.body.idList
  ctx.body = {
    success: true,
    regulationList: db.getSomeRegulation(idList)
  }
}

const saveRegulation = async (ctx) => {
  if (isAdmin(ctx)) {
    const regulationList = ctx.request.body.regulationList
    db.saveRegulation(regulationList)
    ctx.body = {
      success: true,
      info: '保存成功'
    }
  } else  {
    ctx.body = {
      success: false,
      info: '无操作权限'
    }
  }
}

const getCondition = async (ctx) => {
  ctx.body = {
    success: true,
    conditionList: db.getCondition()
  }
}

const saveCondition = async (ctx) => {
  if (isAdmin(ctx)) {
    const conditionList = ctx.request.body.conditionList
    db.saveCondition(conditionList)
    ctx.body = {
      success: true,
      info: '保存成功'
    }
  } else  {
    ctx.body = {
      success: false,
      info: '无操作权限'
    }
  }
}

const getComplexList = async (ctx) => {
  ctx.body = {
    success: true,
    complexList: db.getComplexList()
  }
}

const saveComplexList = async (ctx) => {
  if (isAdmin(ctx)) {
    const complexList = ctx.request.body.complexList
    db.saveComplexList(complexList)
    ctx.body = {
      success: true,
      info: '保存成功'
    }
  } else  {
    ctx.body = {
      success: false,
      info: '无操作权限'
    }
  }
}

const testAuth = async (ctx) => {
  ctx.body = {}
}

const getUserGroup = async (ctx) => {
  if (isAdmin(ctx)) {
    ctx.body = {
      success: true,
      userList: ur.getUserGroup()
    }
  } else {
    ctx.body = {
      success: false,
      info: '无操作权限'
    }
  }
}

const saveUserGroup = async (ctx) => {
  if (isAdmin(ctx)) {
    const userList = ctx.request.body.userList
    ur.saveUserGroup(userList)
    ctx.body = {
      success: true,
      info: '保存成功'
    }
  } else  {
    ctx.body = {
      success: false,
      info: '无操作权限'
    }
  }
}

const isAdmin =  (ctx) => {
  let getHeader = _.split(_.get(ctx, 'request.header.authorization'), ' ')[1]
  return getHeader && jwt.decode(getHeader).authority === 'admin'
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
  testAuth,
  getUserGroup,
  saveUserGroup
}