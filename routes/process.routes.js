const {Router} = require('express')
const Process = require('../models/Process')
const auth = require('../middleware/auth.middleware')
const defaultProcess = require('../config/defaultProcess');
const router = Router()

router.post('/', auth, async (req, res) => {
  try {
    const {process} = req.body

    const bpmnProcess = new Process({
      process, owner: req.user.userId
    })

    await bpmnProcess.save()

    res.status(200).json({ message: 'Процесс создался' })
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const processes = await Process.find({ owner: req.user.userId })
    res.json(processes)
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const process = await Process.findById(req.params.id)
    res.json(process)
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

router.get('/default', auth, async (req, res) => {
  try {
    res.json({ process: defaultProcess })
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

module.exports = router
