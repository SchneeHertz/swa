const Lowdb = require('lowdb')
const LodashId = require('lodash-id')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const _ = require('lodash')

const crypto = require('crypto')
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
})

const user = new FileSync(path.resolve(__dirname,'../../dbs/user.json'))

const ur = Lowdb(user)

ur._.mixin(LodashId)

ur.defaults({
  accounts:[]
}).write()

ur.set('publicKey', publicKey).write()
ur.set('privateKey', privateKey).write()

const getPublicKey = ()=>{
  return ur.get('publicKey').value()
}

const decodeString = (str)=>{
  const rsaPrivateKey = {
    key: ur.get('privateKey').value(),
    padding: crypto.constants.RSA_PKCS1_PADDING,
  }
  const decryptedMessage = crypto.privateDecrypt(
    rsaPrivateKey,
    Buffer.from(str, 'base64'),
  )
  return decryptedMessage.toString('utf8')
}

const insertUser = (account)=>{
  if (!_.isUndefined(account.name) && !_.isUndefined(account.password) && !_.isUndefined(account.email)) {
    let findExistEmail = ur.get('accounts').some(e=>e.email == account.email).value()
    let findExistName = ur.get('accounts').some(e=>e.name == account.name).value()
    if (findExistEmail || findExistName) {
      return {
        success: false,
        info: '该用户名或电子邮箱已被注册'
      }
    } else {
      ur.get('accounts').insert(account).write()
      return {
        success: true,
        info: '账号已注册，请等待管理员审核'
      }
    }
  } else {
    return {
      success: false,
      info: '参数不足'
    }
  }
}

const getUserData = (name)=>{
  return ur.get('accounts').find(e=>e.name === name).value()
}

const changePassword = (user)=>{
  let existUserList = ur.get('accounts').value()
  _.assign(_.find(existUserList, {name: user.name}), user)
  ur.set('accounts', existUserList).write()
}

const getUserGroup = () => {
  let userList = ur.get('accounts').value()
  return userList.map(e=>_.omit(e, 'password'))
}

const saveUserGroup = (userList) => {
  let existUserList = ur.get('accounts').value()
  _.forIn(userList, user=>{
    switch (user.modify) {
      case 'modify':
        delete user.modify
        _.assign(_.find(existUserList, {id: user.id}), user)
        break
      case 'delete':
        delete user.modify
        _.removeById(existUserList, user.id)
        break
    }
  })
  ur.set('accounts', existUserList).write()
}

module.exports = {
  insertUser,
  getUserData,
  getUserGroup,
  saveUserGroup,
  changePassword,
  getPublicKey,
  decodeString
}