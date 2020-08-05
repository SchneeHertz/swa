const auth = require('../controllers/auth')
const router = require('koa-router')()

router.post('/signup', auth.accountRegister)
router.post('/login', auth.userAuth)
router.post('/cpw', auth.changePassword)
router.get('/get-mailto-link', auth.getMailtoLink)

module.exports = router