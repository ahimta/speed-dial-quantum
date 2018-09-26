const faker = require('faker')

exports.group = () => ({
  id: faker.random.uuid(),
  name: faker.random.alphaNumeric(10),
  rows: Math.round(faker.random.number({ min: 1, max: 10 })),
  cols: Math.round(faker.random.number({ min: 1, max: 10 })),
  thumbnailImgSize: faker.random.arrayElement([
    'auto',
    'small',
    'medium',
    'large'
  ])
})

exports.uuid = () => faker.random.uuid()
