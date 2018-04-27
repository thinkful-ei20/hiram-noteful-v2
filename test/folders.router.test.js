const app = require(`../server`)
const chai = require(`chai`)
const chaiHttp = require(`chai-http`)
const seedData = require(`../db/seedData`)
const knex = require(`../knex`)
const join = require(`path`).join

const expect = chai.expect
chai.use(chaiHttp)

describe.skip(`Folders endpoints`, function() {
  beforeEach(function() {
    return seedData(join(__dirname, `..`, `db`, `setup.pgsql`))
  })

  after(function() {
    return knex.destroy() // destroy the connection
  })
})
