const app = require(`../server`)
const chai = require(`chai`)
const chaiHttp = require(`chai-http`)
const seedData = require(`../db/seedData`)
const knex = require(`../knex`)
const join = require(`path`).join

const expect = chai.expect
chai.use(chaiHttp)

describe.only(`Tags endpoints`, function() {
  beforeEach(function() {
    return seedData(join(__dirname, `..`, `db`, `setup.pgsql`))
  })

  after(function() {
    return knex.destroy() // destroy the connection
  })

  describe(`GET /api/tags`, function() {
    it(`should return all tags`, function() {
      let count
      return knex(`tags`)
        .count()
        .then(([result]) => {
          count = Number(result.count)
          return chai.request(app).get(`/api/tags`)
        })
        .then(function(res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          expect(res.body).to.have.length(count)
        })
    })

    it(`should return a list with the correct fields`, function() {
      return chai
        .request(app)
        .get(`/api/tags`)
        .then(function(res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          res.body.forEach(function(item) {
            expect(item).to.be.a(`object`)
            expect(item).to.include.keys(`id`, `name`)
          })
        })
    })
  })

  describe(`GET /api/tags/:id`, function() {
    it(`should return correct tags`, function() {
      const id = 100
      const dataPromise = knex(`tags`)
        .first()
        .where(`id`, id)
      const apiPromise = chai.request(app).get(`/api/tags/${id}`)

      return Promise.all([dataPromise, apiPromise]).then(function([data, res]) {
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.be.an(`object`)
        expect(res.body).to.include.keys(`id`, `name`)
        expect(res.body.id).to.equal(id)
        expect(res.body.name).to.equal(data.name)
      })
    })

    it(`should respond with a 404 for an invalid id`, function() {
      return chai
        .request(app)
        .get(`/DOES/NOT/EXIST`)
        .then(res => {
          expect(res).to.have.status(404)
        })
    })
  })

  describe(`POST /api/tags`, function() {
    it(`should create and return a new item when provided valid data`, function() {
      const newItem = {
        name: `Smooches`,
      }
      let body
      return chai
        .request(app)
        .post(`/api/tags`)
        .send(newItem)
        .then(function(res) {
          body = res.body
          expect(res).to.have.status(201)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(`id`, `name`)
          expect(res).to.have.header(`location`)
          return knex(`tags`)
            .select()
            .where(`id`, body.id)
        })
        .then(([data]) => {
          expect(body.name).to.eq(data.name)
        })
    })

    it(`should return an error when missing "name" field`, function() {
      const newItem = {
        foo: `bar`,
      }
      return chai
        .request(app)
        .post(`/api/tags`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.equal(`Missing \`name\` in request body`)
        })
    })
  })

  describe(`PUT /api/tags/:id`, function() {
    it(`should update the tag`, function() {
      const id = 103
      const updateItem = {
        name: `What about dogs?!`,
      }
      let body
      return chai
        .request(app)
        .put(`/api/tags/${id}`)
        .send(updateItem)
        .then(res => {
          body = res.body
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(`id`, `name`)
          return knex(`tags`)
            .select()
            .where(`id`, id)
        })
        .then(([data]) => {
          expect(data.name).to.eq(body.name)
        })
    })

    it(`should respond with a 404 for an invalid id`, function() {
      const updateItem = {
        name: `What about dogs?!`,
      }
      return chai
        .request(app)
        .put(`/DOES/NOT/EXIST`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404)
        })
    })

    it(`should return an error when missing "name" field`, function() {
      const updateItem = {
        foo: `bar`,
      }
      return chai
        .request(app)
        .put(`/api/tags/105`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.equal(`Missing \`name\` in request body`)
        })
    })
  })

  describe(`DELETE /api/tags/:id`, function() {
    it(`should delete an item by id`, function() {
      const id = 102
      return chai
        .request(app)
        .delete(`/api/tags/${id}`)
        .then(function(res) {
          expect(res).to.have.status(204)
          return knex(`tags`)
            .select()
            .where(`id`, id)
        })
        .then(results => {
          expect(results).to.have.length(0)
        })
    })
  })
})
