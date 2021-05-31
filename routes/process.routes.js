const {Router} = require('express')
const Process = require('../models/Process')
const auth = require('../middleware/auth.middleware')
const router = Router()

router.post('/', auth, async (req, res) => {
  try {
    const {process, name} = req.body

    const bpmnProcess = new Process({
      process, name, owner: req.user.userId
    })

    await bpmnProcess.save()

    res.status(200).json({ message: 'Процесс создался' })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

router.put('/', auth, async (req, res) => {
  try {
    const {processId} = req.body;

    return Process.findOneAndUpdate({_id: processId}, req.body, {
      new: true,
      upsert: true,
      returnOriginal: true
    }, (err, updatedObject) => {
      if (err || !updatedObject) {
        return res.json({ error: err });
      } else {
        return res.json({ id: updatedObject._id })
      }
    });
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

module.exports = router
