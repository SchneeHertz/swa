const generalData = require('../controllers/generalData')
const caseData = require('../controllers/caseData')
const sgsAPI = require('../controllers/sgsAPI')
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
router.get('/getComplexList', generalData.getComplexList)
router.post('/saveComplexList', generalData.saveComplexList)
router.get('/testAuth', generalData.testAuth)
router.get('/getUserGroup', generalData.getUserGroup)
router.post('/saveUserGroup', generalData.saveUserGroup)

router.post('/getCaseData', caseData.getCaseData)
router.post('/saveCaseData', caseData.saveCaseData)

router.post('/getUserHistoryCase', caseData.getUserHistoryCase)
router.get('/getUserHistoryCount', caseData.getUserHistoryCount)

router.post('/getTranslate', sgsAPI.getTranslate)
router.post('/getSpellcheck', sgsAPI.getSpellcheck)

module.exports = router