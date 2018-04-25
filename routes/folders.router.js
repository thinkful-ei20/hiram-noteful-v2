const express = require(`express`)
const knex = require(`../knex`)

const router = express.Router()

router.get(`/`, (req, res, next) => {
  // get all folders
  knex(`folders`)
    .select(`id`, `name`)
    .then(results => res.json(results))
    .catch(next)
})

router.get(`/:id`, (req, res, next) => {
  // get folder by id
  const id = req.params.id

  knex(`folders`)
    .select(`id`, `name`)
    .where(`id`, id)
    .first()
    .then(result => {
      if (result) res.json(result)
      else next()
    })
    .catch(next)
})

router.put(`/:id`, (req, res, next) => {
  // update folder
  const id = req.params.id

  const updateObj = {}
  const updateableFields = [`name`]

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field]
    }
  })

  if (!updateObj.name) {
    const err = new Error(`Missing name in request body`)
    err.status = 400
    return next(err)
  }

  knex(`folders`)
    .update(updateObj, [`id`, `name`])
    .where(`id`, id)
    .first()
    .then(result => {
      if (result) res.json(result)
      else next()
    })
    .catch(next)
})

router.post(`/`, (req, res, next) => {
  // create new folder
  const { name } = req.body

  const newItem = { name }

  if (!newItem.name) {
    const err = new Error(`Missing name in request body`)
    err.status = 400
    return next(err)
  }

  knex(`folders`)
    .insert(newItem, [`id`, `name`])
    .first()
    .then(result => {
      if (result) {
        res
          .location(`http://${req.headers.host}/api/folders/${result.id}`)
          .status(201)
          .json(result)
      }
    })
})

router.delete(`/:id`, (req, res, next) => {
  // delete a folder
  const id = req.params.id

  knex(`folders`)
    .where(`id`, id)
    .del()
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
