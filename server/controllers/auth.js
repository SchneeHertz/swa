const _ = require('lodash')
const config = require('../../config')
const jwt = require('jsonwebtoken')
const user = require('../models/user')
const nodemailer = require('nodemailer')

const accountRegister = async (ctx) => {
  const name = ctx.request.body.name
  const password = ctx.request.body.password
  const email =ctx.request.body.email

  let account = {
    name: name,
    password: user.decodeString(password),
    email: email,
    authority: 'none',
    pwUpdate: Date.now()
  }
  let registerResult = user.insertUser(account)
  if (registerResult.success) {
    let receives = _.filter(user.getUserGroup(), e=>e.authority === 'admin').map(e=>e.email)
    await sendMail(account, receives)
  }
  ctx.body = registerResult
}

const userAuth = async (ctx) => {
  const name = ctx.request.body.name
  const password = ctx.request.body.password
  let findUser = user.getUserData(name)
  if (findUser) {
    if (findUser.password === user.decodeString(password)) {
      if (findUser.pwUpdate && Date.now() - findUser.pwUpdate < 31536000000) {
        if (findUser.authority === 'user' || findUser.authority === 'admin') {
          const userToken = {
            name: findUser.name,
            authority: findUser.authority,
            otsId: findUser.otsId,
            id: findUser.id
          }
          const secret = config.jwt_seed
          const token = jwt.sign(userToken, secret, { expiresIn: '12h' })
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
        info: '登录失败，用户名或密码错误'
      }
    }
  } else {
    ctx.body = {
      success: false,
      info: '登录失败，用户名或密码错误'
    }
  }
}

const changePassword = async (ctx) =>{
  const name = ctx.request.body.name
  const oldpassword = ctx.request.body.oldpassword
  const password = ctx.request.body.password
  let findUser = user.getUserData(name)
  if (findUser) {
    if (findUser.password === user.decodeString(oldpassword)) {
      user.changePassword({
        name: name,
        password: user.decodeString(password),
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

const sendMail = async (account, receivers) => {
  let transporter = nodemailer.createTransport({
    host: "smtp-atl.sgs.net",
    port: 25,
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  })
  await transporter.sendMail({
    from: account.email,
    to: receivers.join(', '),
    subject: 'Sampling Web App Permission Request',
    html:  `<p>Account ${account.email} is registered, please review.</p>`
  })
}

const getPublicKey = async (ctx) => {
  ctx.body = {
    publicKey: user.getPublicKey()
  }
}

module.exports = {
  accountRegister,
  userAuth,
  changePassword,
  getPublicKey
}
