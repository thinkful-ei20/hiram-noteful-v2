const express = require(`express`)
const knex = require(`../knex`)

const router = express.Router()

// Get all
router.get(`/`, (req, res, next) => {
  knex(`tags`)
    .select()
    .then(results => res.json(results))
    .catch(next)
})

// Get by id
router.get(`/:id`, (req, res, next) => {
  const { id } = req.params

  knex(`tags`)
    .select()
    .first()
    .where(`id`, id)
    .then(result => (result ? res.json(result) : next()))
    .catch(next)
})

// Add
router.post(`/`, (req, res, next) => {
  const { name } = req.body

  if (!name) {
    const err = new Error(`Missing 'name' in request body`)
    err.status = 400
    return next(err)
  }

  const newItem = { name }

  knex(`tags`)
    .insert(newItem, [`id`, `name`])
    .then(([result]) =>
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result)
    )
    .catch(next)
})

// Update
router.put(`/:id`, (req, res, next) => {
  const { id } = req.params

  const updateObj = `name` in req.body ? { name } : {}
  if (!updateObj.name) {
    const err = new Error(`Missing 'name' in request body`)
    err.status = 400
    next(err)
  }

  knex(`tags`)
    .update(updateObj, `*`)
    .where(`id`, id)
    .then(([result]) => (result ? res.json(result) : next()))
    .catch(next)
})

// Delete
router.delete(`/:id`, (req, res, next) => {
  const { id } = req.params

  knex(`tags`)
    .where(`id`, id)
    .del()
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
