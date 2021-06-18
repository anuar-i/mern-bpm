const {Router} = require('express')
const auth = require('../middleware/auth.middleware')
const defaultProcess = require('../config/defaultProcess');
const router = Router()

router.get('/', auth, async (req, res) => {
  try {
    res.json({ ...defaultProcess })
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

module.exports = router
