const _ = require('lodash')
const config = require('../../config')
const jwt = require('jsonwebtoken')
const user = require('../models/user')

const accountRegister = async (ctx) => {
  const name = ctx.request.body.name
  const password = ctx.request.body.password
  const email =ctx.request.body.email

  let account = {
    name: name,
    password: password,
    email: email,
    authority: 'none',
    pwUpdate: Date.now()
  }
  ctx.body = user.insertUser(account)
}

const userAuth = async (ctx) => {
  const name = ctx.request.body.name
  const password = ctx.request.body.password
  let findUser = user.getUserData(name)
  if (findUser) {
    if (findUser.password === password) {
      if (findUser.pwUpdate && Date.now() - findUser.pwUpdate < 31536000000) {
        if (findUser.authority === 'user' || findUser.authority === 'admin') {
          const userToken = {
            name: findUser.name,
            authority: findUser.authority
          }
          const secret = config.jwt_seed
          const token = jwt.sign(userToken,secret)
          ctx.body = {
            success: true,
            token: token,
          }
        } else {
          ctx.body = {
            success: false,
            info: '无权限用户'
          }
        }
      } else {
        ctx.body = {
          success: false,
          redirect: '/changepassword',
          info: '登录失败，密码已过期'
        }
      }
    } else {
      ctx.body = {
        success: false,
        info: '登录失败，密码错误'
      }
    }
  } else {
    ctx.body = {
      success: false,
      info: '用户名错误或用户不存在'
    }
  }
}

const changePassword = async (ctx) =>{
  const name = ctx.request.body.name
  const oldpassword = ctx.request.body.oldpassword
  const password = ctx.request.body.password
  let findUser = user.getUserData(name)
  if (findUser) {
    if (findUser.password === oldpassword) {
      user.changePassword({
        name: name,
        password: password,
        pwUpdate: Date.now()
      })
      ctx.body = {
        success: true,
        info: '修改密码成功'
      }
    } else {
      ctx.body = {
        success: false,
        info: '旧密码错误'
      }
    }
  } else {
    ctx.body = {
      success: false,
      info: '用户名错误或用户不存在'
    }
  }
}

const getMailtoLink = async (ctx) =>{
  let mails = _.filter(user.getUserGroup(), e=>e.authority === 'admin').map(e=>e.email)
  ctx.body = {
    success: true,
    info: mails.join(';')
  }
}

module.exports = {
  accountRegister,
  userAuth,
  changePassword,
  getMailtoLink
}
