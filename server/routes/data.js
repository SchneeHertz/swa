const generalData = require('../controllers/generalData')
const caseData = require('../controllers/caseData')
const router = require('koa-router')()

router.get('/getMaterialList', generalData.getMaterialList)
router.post('/saveMaterialList', generalData.saveMaterialList)
router.get('/getMethodList', generalData.getMethodList)
router.post('/saveMethodList', generalData.saveMethodList)
router.get('/getRegulation', generalData.getRegulation)
router.post('/getRegulation', generalData.getSomeRegulation)
router.post('/saveRegulation', generalData.saveRegulation)
router.get('/getCondition', generalData.getCondition)
router.post('/saveCondition', generalData.saveCondition)
router.get('/testAuth', generalData.testAuth)
router.get('/getUserGroup', generalData.getUserGroup)
router.post('/saveUserGroup', generalData.saveUserGroup)

router.post('/getCaseData', caseData.getCaseData)
router.post('/saveCaseData', caseData.saveCaseData)

module.exports = router