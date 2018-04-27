const app = require(`../server`)
const chai = require(`chai`)
const chaiHttp = require(`chai-http`)
const seedData = require(`../db/seedData`)
const knex = require(`../knex`)
const join = require(`path`).join

const expect = chai.expect
chai.use(chaiHttp)

describe(`Notes endpoints`, function() {
  beforeEach(function() {
    return seedData(join(__dirname, `..`, `db`, `setup.pgsql`))
  })

  after(function() {
    return knex.destroy() // destroy the connection
  })

  describe(`GET /api/notes`, function() {
    it(`should return all notes`, function() {
      let count
      return knex(`notes`)
        .count()
        .then(([result]) => {
          count = Number(result.count)
          return chai.request(app).get(`/api/notes`)
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
        .get(`/api/notes`)
        .then(function(res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          expect(res.body).to.have.length(10)
          res.body.forEach(function(item) {
            expect(item).to.be.a(`object`)
            expect(item).to.include.keys(`id`, `title`, `content`)
          })
        })
    })

    it(`should return correct search results for a valid query`, function() {
      let res
      return chai
        .request(app)
        .get(`/api/notes?searchTerm=tall`)
        .then(function(_res) {
          res = _res
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          expect(res.body).to.have.length(7)
          expect(res.body[0]).to.be.an(`object`)
          return knex(`notes`)
            .select()
            .where(`title`, `like`, `%tall%`)
        })
        .then(data => {
          expect(res.body[0].id).to.eq(data[0].id)
        })
    })

    it(`should return an empty array for an incorrect query`, function() {
      return chai
        .request(app)
        .get(`/api/notes?searchTerm=Not%20a%20Valid%20Search`)
        .then(function(res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          expect(res.body).to.have.length(0)
        })
    })
  })

  describe(`GET /api/notes/:id`, function() {
    it(`should return correct notes`, function() {
      const dataPromise = knex(`notes`)
        .first()
        .where(`id`, 10000)
      const apiPromise = chai.request(app).get(`/api/notes/10000`)

      return Promise.all([dataPromise, apiPromise]).then(function([data, res]) {
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.be.an(`object`)
        expect(res.body).to.include.keys(`id`, `title`, `content`)
        expect(res.body.id).to.equal(10000)
        expect(res.body.title).to.equal(data.title)
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

  describe(`POST /api/notes`, function() {
    it(`should create and return a new item when provided valid data`, function() {
      const newItem = {
        title: `The best article about cats ever!`,
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...`,
        tags: [],
      }
      let body
      return chai
        .request(app)
        .post(`/api/notes`)
        .send(newItem)
        .then(function(res) {
          body = res.body
          expect(res).to.have.status(201)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(`id`, `title`, `content`)
          expect(res).to.have.header(`location`)
          return knex(`notes`)
            .select()
            .where(`id`, body.id)
        })
        .then(([data]) => {
          expect(body.title).to.eq(data.title)
          expect(body.content).to.eq(data.content)
        })
    })

    it(`should return an error when missing "title" field`, function() {
      const newItem = {
        foo: `bar`,
      }
      return chai
        .request(app)
        .post(`/api/notes`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.equal(`Missing \`title\` in request body`)
        })
    })
  })

  describe(`PUT /api/notes/:id`, function() {
    it(`should update the note`, function() {
      const updateItem = {
        title: `What about dogs?!`,
        content: `woof woof`,
        tags: [],
      }
      let body
      return chai
        .request(app)
        .put(`/api/notes/10005`)
        .send(updateItem)
        .then(res => {
          body = res.body
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(`id`, `title`, `content`, `tags`)
          return knex(`notes`)
            .select()
            .where(`id`, 10005)
        })
        .then(([data]) => {
          expect(body.title).to.eq(updateItem.title)
          expect(body.content).to.eq(updateItem.content)
          expect(body.tags).to.deep.eq(updateItem.tags)
        })
    })

    it(`should respond with a 404 for an invalid id`, function() {
      const updateItem = {
        title: `What about dogs?!`,
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

    it(`should return an error when missing "title" field`, function() {
      const updateItem = {
        foo: `bar`,
      }
      return chai
        .request(app)
        .put(`/api/notes/1005`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.equal(`Missing \`title\` in request body`)
        })
    })
  })

  describe(`DELETE  /api/notes/:id`, function() {
    it(`should delete an item by id`, function() {
      return chai
        .request(app)
        .delete(`/api/notes/10005`)
        .then(function(res) {
          expect(res).to.have.status(204)
          return knex(`notes`)
            .select()
            .where(`id`, 10005)
        })
        .then(results => {
          expect(results).to.have.lengthOf(0)
        })
    })
  })
})
