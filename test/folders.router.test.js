const app = require(`../server`)
const chai = require(`chai`)
const chaiHttp = require(`chai-http`)
const seedData = require(`../db/seedData`)
const knex = require(`../knex`)
const join = require(`path`).join

const expect = chai.expect
chai.use(chaiHttp)

describe(`Folders endpoints`, function() {
  beforeEach(function() {
    return seedData(join(__dirname, `..`, `db`, `setup.pgsql`))
  })

  describe(`GET /api/folders`, function() {
    it(`should return all folders`, function() {
      let count
      return knex(`folders`)
        .count()
        .then(([result]) => {
          count = Number(result.count)
          return chai.request(app).get(`/api/folders`)
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
        .get(`/api/folders`)
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

  describe(`GET /api/folders/:id`, function() {
    it(`should return correct folders`, function() {
      const id = 1000
      const dataPromise = knex(`folders`)
        .first()
        .where(`id`, id)
      const apiPromise = chai.request(app).get(`/api/folders/${id}`)

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

  describe(`POST /api/folders`, function() {
    it(`should create and return a new item when provided valid data`, function() {
      const newItem = {
        name: `Smooches`,
      }
      let body
      return chai
        .request(app)
        .post(`/api/folders`)
        .send(newItem)
        .then(function(res) {
          body = res.body
          expect(res).to.have.status(201)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(`id`, `name`)
          expect(res).to.have.header(`location`)
          return knex(`folders`)
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
        .post(`/api/folders`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.equal(`Missing \`name\` in request body`)
        })
    })
  })

  describe(`PUT /api/folders/:id`, function() {
    it(`should update the note`, function() {
      const id = 1002
      const updateItem = {
        name: `What about dogs?!`,
      }
      let body
      return chai
        .request(app)
        .put(`/api/folders/${id}`)
        .send(updateItem)
        .then(res => {
          body = res.body
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(`id`, `name`)
          return knex(`folders`)
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
        content: `woof woof`,
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
        .put(`/api/folders/1005`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.equal(`Missing \`name\` in request body`)
        })
    })
  })

  describe(`DELETE /api/folders/:id`, function() {
    it(`should delete an item by id`, function() {
      const id = 1002
      return chai
        .request(app)
        .delete(`/api/folders/${id}`)
        .then(function(res) {
          expect(res).to.have.status(204)
          return knex(`folders`)
            .select()
            .where(`id`, id)
        })
        .then(results => {
          expect(results).to.have.length(0)
        })
    })
  })
})
