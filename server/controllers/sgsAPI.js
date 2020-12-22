const axios = require('axios')
const config = require('../../config')

const getTranslate = async (ctx) => {
  let text = ctx.request.body.text
  ctx.body = await axios.post(config.sgsTranslateAPI, {
    categoryId: config.categoryId,
    isHtml: false,
    texts: [text]
  }, {
    headers: {
      'sgs-token': config.sgsToken
    }
  })
  .then(res=>{
    return res.data
  })
}

const getSpellcheck = async (ctx) => {
  let text = ctx.request.body.text
  ctx.body = await axios.post(config.sgsSpellcheckAPI, {
    language: 'en-US',
    text: text
  }, {
    headers: {
      'sgs-token': config.sgsToken
    }
  })
  .then(res=>{
    return res.data
  })
}

module.exports = {
  getTranslate,
  getSpellcheck
}