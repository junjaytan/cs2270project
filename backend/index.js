var express = require('express')
var app = express()
var cors = require('cors')
const port = 8000

var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://postgres@localhost:5432/testdata')

app.use(cors())

// respond with "hello world" when a GET request is made to the homepage
app.get('/datasets', function (req, res) {
  res.send('["datset1","otherdata"]')
})

app.get('/data', function (req, res) {
  db.any(`SELECT start_date, end_date, json_agg(sine1_value ORDER BY my_datetime)
  FROM sinewaves_matching_ranges_temp, sinewaves_data
  WHERE sinewaves_data.my_datetime >=start_date AND sinewaves_data.my_datetime <= end_date
  GROUP BY start_date, end_date
  ORDER BY end_date DESC
  LIMIT 10;`)
  .then(function (data) {
    res.send(data)
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
