const auth = require('../controllers/auth')
const router = require('koa-router')()

router.post('/signup', auth.accountRegister)
router.post('/login', auth.userAuth)
router.post('/cpw', auth.changePassword)
router.get('/getPublicKey', auth.getPublicKey)

module.exports = router