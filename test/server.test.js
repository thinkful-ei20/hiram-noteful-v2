const app = require(`../server`)
const chai = require(`chai`)
const chaiHttp = require(`chai-http`)
const knex = require(`../knex`)

const expect = chai.expect
chai.use(chaiHttp)

describe(`Reality check`, () => {
  it(`true should be true`, () => {
    expect(true).to.be.true
  })

  it(`2 + 2 should equal 4`, () => {
    expect(2 + 2).to.eq(4)
  })
})

describe(`Environment`, () => {
  it(`NODE_ENV should be "test"`, () => {
    expect(process.env.NODE_ENV).to.equal(`test`)
  })

  it(`connection should be test database`, () => {
    expect(knex.client.connectionSettings.database).to.equal(`noteful-test`)
  })
})

describe(`Express static`, () => {
  it(`GET request "/" should return index page`, () => {
    return chai
      .request(app)
      .get(`/`)
      .then(res => {
        expect(res).to.exist
        expect(res).to.have.status(200)
        expect(res).to.be.html
      })
  })
})

describe(`404 handler`, () => {
  it(`should respond with 404 when given a bad path`, () => {
    return chai
      .request(app)
      .get(`/bad/path`)
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(404)
      })
  })
})
