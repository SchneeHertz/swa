const data = require('../controllers/data')
const router = require('koa-router')()

router.get('/getMaterialList', data.getMaterialList)
// router.post('/saveRegulation', data.saveRegulation)
// router.get('/getCondition', data.getCondition)
// router.post('/saveCondition', data.saveCondition)
// router.get('/getInfoList', data.getInfoList)
// router.post('/saveInfoList', data.saveInfoList)
router.get('/testAuth', data.testAuth)
// router.get('/getUserGroup', data.getUserGroup)
// router.post('/saveUserGroup', data.saveUserGroup)

module.exports = router