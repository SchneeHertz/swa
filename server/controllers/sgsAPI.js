const axios = require('axios')

const sgsToken = 'nVSIoNct5DlJIK4USW9dYv33HepLaJa0POLVJ19U9uE9FWsylSH8T4tOOhUF0wp'
const categoryId = 'd1adbad6-b269-48fd-bad0-9b71beec2395-GENERAL'
const sgsTranslateAPI = 'https://cognitivehub.sgs.com/api/text/5cc823ea-4965-407d-9dff-f4dd6d10991b/translate/en/zh-Hans'
const sgsSpellcheckAPI = 'https://cognitivehub.sgs.com/api/Text/5cc823ea-4965-407d-9dff-f4dd6d10991b/spellcheck/en-US'

const getTranslate = async (ctx) => {
  let text = ctx.request.body.text
  ctx.body = await axios.post(sgsTranslateAPI, {
    categoryId: categoryId,
    isHtml: false,
    texts: [text]
  }, {
    headers: {
      'sgs-token': sgsToken
    }
  })
  .then(res=>{
    return res.data
  })
}

const getSpellcheck = async (ctx) => {
  let text = ctx.request.body.text
  ctx.body = await axios.post(sgsSpellcheckAPI, {
    language: 'en-US',
    text: text
  }, {
    headers: {
      'sgs-token': sgsToken
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