"use strict"

const express = require(`express`)
const knex = require(`../knex`)

// Create an router instance (aka "mini-app")
const router = express.Router()

// Get All (and search by query)
router.get(`/notes`, (req, res, next) => {
  const { searchTerm } = req.query

  knex(`notes`)
    .select(`id`, `title`, `content`)
    .modify(queryBuilder => {
      if (searchTerm) queryBuilder.where(`title`, `LIKE`, `%${searchTerm}%`)
    })
    .orderBy(`id`)
    .then(results => res.json(results))
    .catch(next)
})

// Get a single item
router.get(`/notes/:id`, (req, res, next) => {
  const id = req.params.id

  knex(`notes`)
    .select(`id`, `title`, `content`)
    .where(`id`, id)
    .limit(1)
    .then(results => {
      if (results[0]) res.json(results[0])
      else next()
    })
    .catch(next)
})

// Put update an item
router.put(`/notes/:id`, (req, res, next) => {
  const id = req.params.id

  /***** Never trust users - validate input *****/
  const updateObj = {}
  const updateableFields = [`title`, `content`]

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field]
    }
  })

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error(`Missing \`title\` in request body`)
    err.status = 400
    return next(err)
  }

  knex(`notes`)
    .update(updateObj, [`id`, `title`, `content`])
    .where(`id`, id)
    .then(result => {
      if (result[0]) res.json(result[0])
      else next()
    })
    .catch(next)
})

// Post (insert) an item
router.post(`/notes`, (req, res, next) => {
  const { title, content } = req.body

  const newItem = { title, content }
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error(`Missing \`title\` in request body`)
    err.status = 400
    return next(err)
  }

  knex(`notes`)
    .insert(newItem, [`id`, `title`, `content`])
    .then(results => {
      if (results[0])
        res
          .location(`http://${req.headers.host}/notes/${results[0].id}`)
          .status(201)
          .json(results[0])
      else next()
    })
    .catch(next)
})

// Delete an item
router.delete(`/notes/:id`, (req, res, next) => {
  const id = req.params.id

  knex(`notes`)
    .where(`id`, id)
    .del()
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
