const express = require('express')
var cors = require('cors')
const app = express()

app.use(cors());

app.get('/', (req, res) =>{
	res.json({msg: 'THIS IS A TEST'})
	res.send('HEY!')
})

app.listen(3000, () =>console.log('server running'))
