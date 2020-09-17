const { test, skip } = require('zora')
/** @type { import('../lib/decoda').Decoda } */
const decoda = require('../dist/decoda.umd')


// CSV

test('CSV (header=ON,json=ON))', assert => {
  const csv = `
id,name,price,already_known
1,"Jargon",14.99,false
2,"Remember",0.99,true
  `.trim()

  const data = decoda.csv(csv, { header: true, json: true })

  assert.equal(data.length, 2)
  assert.equal(data[0], { id: 1, name: 'Jargon', price: 14.99, already_known: false })
})

test('CSV (header=ON,json=OFF)', assert => {
  const csv = `
id,name,price,already_known
1,Jargon,14.99,false
2,Remember,0.99,true
  `.trim()

  const data = decoda.csv(csv, { header: true })

  assert.equal(data.length, 2)
  assert.equal(
    data[0],
    {
      id: '1',
      name: 'Jargon',
      price: '14.99',
      already_known: 'false'
    }
  )
})

test('CSV (header=OFF)', assert => {
  const csv = `
4,"Bedford manner",100,"yes"
1011,"",5.26,"yes"
  `.trim()

  const data = decoda.csv(csv, { json: true })

  assert.equal(data.length, 2)
  assert.equal(
    data[0],
    {
      x1: 4,
      x2: 'Bedford manner',
      x3: 100,
      x4: 'yes'
    }
  )

  const keys = ['x1', 'x2', 'x3', 'x4']
  for (const key of keys) {
    assert.ok(data[0].hasOwnProperty(key))
  }
})


// CONFIG

test('Config nested property', assert => {
  const { app, bareKey } = decoda.config(`
app.name: "awesome-node"
app.bytes: 4096
app.subkey.trusts: [1, 2, 3003]

bareKey: "Hello, I am free"
  `, { json: true })

  assert.equal(bareKey, 'Hello, I am free')
  assert.equal(app.name, 'awesome-node')
  assert.equal(app.bytes, 4096)
  assert.equal(app.subkey.trusts, [1, 2, 3003])
})

test('Config comments and delimiters', assert => {
  const config = decoda.config(`
# ignored = true
considered.harmful = no
myNumber = 1024
  `)

  assert.notOk('ignored' in config)
  assert.equal(config.considered.harmful, 'no')
})