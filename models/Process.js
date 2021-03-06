const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
  process: {type: String, required: true},
  processXml: {type: String, required: true},
  name: {type: String, required: true},
  date: {type: Date, default: Date.now},
  owner: {type: Types.ObjectId, ref: 'User'}
})

module.exports = model('Process', schema)
