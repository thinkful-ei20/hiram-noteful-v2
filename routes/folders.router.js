const express = require(`express`)
const knex = require(`../knex`)

const router = express.router()

router.get(`/`, (req, res, next) => {
  // get all folders
  knex(`folders`)
    .select(`id`, `name`)
    .then(results => res.json(results))
    .catch(next)
})

router.get(`/:id`, (req, res, next) => {
  // get folder by id
})

router.put(`/:id`, (req, res, next) => {
  // update folder
})

router.post(`/`, (req, res, next) => {
  // create new folder
})

router.delete(`/:id`, (req, res, next) => {
  // delete a folder
})

module.exports = router
