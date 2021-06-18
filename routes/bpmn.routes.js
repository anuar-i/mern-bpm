const { Router } = require('express');
const auth = require('../middleware/auth.middleware')
const router = Router();
const { Engine } = require("bpmn-engine");
const { EventEmitter } = require('events');
const Process = require('../models/Process');


router.get('/:id', auth, async (req, res) => {
  try {
    const { processId } = req.params;

    const { name, process, processXml: source } = await Process.findOne({ id: processId });

    if (process) {
      const engine = Engine({
        name,
        source
      });

      const listener = new EventEmitter();

      listener.once('wait', (task) => {
        task.signal({
          ioSpecification: {
            dataOutputs: [{
              id: 'userInput',
              value: 'von Rosen',
            }]
          }
        });
      });

      listener.on('flow.take', (flow) => {
        console.log(`flow <${flow.id}> was taken`);
      });

      engine.once('end', (execution) => {
        console.log(execution.environment.variables);
        console.log(`User surname is ${execution.environment.output.data.inputFromUser}`);
      });

      engine.execute({
        listener
      }, (err) => {
        if (err) throw err;

        res.json({ message: `Execution completed.` });
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

module.exports = router
