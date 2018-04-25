"use strict"

const express = require(`express`)
const knex = require(`../knex`)

// Create an router instance (aka "mini-app")
const router = express.Router()

// Get All (and search by query)
router.get(`/notes`, (req, res, next) => {
  const { searchTerm, folderId } = req.query

  knex(`notes`)
    .select(
      `notes.id`,
      `title`,
      `content`,
      `folders.id as folder_id`,
      `folders.name as folderName`
    )
    .leftJoin(`folders`, `notes.folder_id`, `folders.id`)
    .modify(queryBuilder => {
      if (searchTerm) queryBuilder.where(`title`, `LIKE`, `%${searchTerm}%`)
    })
    .modify(queryBuilder => {
      if (folderId) queryBuilder.where(`folder_id`, folderId)
    })
    .orderBy(`id`)
    .then(results => res.json(results))
    .catch(next)
})

// Get a single item
router.get(`/notes/:id`, (req, res, next) => {
  const id = req.params.id

  knex(`notes`)
    .select(
      `notes.id`,
      `title`,
      `content`,
      `folders.id as folderId`,
      `folders.name as folderName`
    )
    .leftJoin(`folders`, `notes.folder_id`, `folders.id`)
    .where(`notes.id`, id)
    .first()
    .then(result => {
      if (result) res.json(result)
      else next()
    })
    .catch(next)
})

// Put update an item
router.put(`/notes/:id`, (req, res, next) => {
  const id = req.params.id

  /***** Never trust users - validate input *****/
  const updateObj = {}
  const updateableFields = [`title`, `content`, `folder_id`]

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
    .update(updateObj)
    .where(`id`, id)
    .then(() => {
      knex(`notes`)
        .select(
          `notes.id`,
          `title`,
          `content`,
          `folder_id`,
          `folders.name as folder_name`
        )
        .leftJoin(`folders`, `notes.folder_id`, `folders.id`)
        .where(`notes.id`, id)
    })
    .then(([result]) => {
      if (result) res.json(result)
      else next()
    })
    .catch(next)
})

// Post (insert) an item
router.post(`/notes`, (req, res, next) => {
  const { title, content, folder_id } = req.body

  const newItem = { title, content, folder_id }
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error(`Missing \`title\` in request body`)
    err.status = 400
    return next(err)
  }
  let noteId

  knex(`notes`)
    .insert(newItem, [`id`])
    .then(([id]) => {
      noteId = id
      return knex(`notes`)
        .select(
          `notes.id`,
          `title`,
          `content`,
          `folder_id`,
          `folders.name as folder_name`
        )
        .leftJoin(`folders`, `notes.folder_id`, `folders.id`)
        .where(`notes.id`, noteId)
    })
    .then(([result]) => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result)
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
