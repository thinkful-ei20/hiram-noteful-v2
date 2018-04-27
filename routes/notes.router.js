"use strict"

const express = require(`express`)
const knex = require(`../knex`)
const hydrateNotes = require(`../utils/hydrateNotes`)

// Create an router instance (aka "mini-app")
const router = express.Router()

// Get All (and search by query)
router.get(`/`, (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query

  knex(`notes`)
    .select(
      `notes.id`,
      `title`,
      `content`,
      `folders.id as folderId`,
      `folders.name as folderName`,
      `tags.id as tagId`,
      `tags.name as tagName`
    )
    .leftJoin(`folders`, `notes.folder_id`, `folders.id`)
    .leftJoin(`notes_tags`, `notes.id`, `note_id`)
    .leftJoin(`tags`, `tag_id`, `tags.id`)
    .modify(queryBuilder => {
      if (searchTerm) queryBuilder.where(`title`, `LIKE`, `%${searchTerm}%`)
    })
    .modify(queryBuilder => {
      if (folderId) queryBuilder.where(`folder_id`, folderId)
    })
    .modify(queryBuilder => {
      if (tagId) queryBuilder.where(`tags.id`, tagId)
    })
    .orderBy(`id`)
    .then(results => res.json(hydrateNotes(results)))
    .catch(next)
})

// Get a single item
router.get(`/:id`, (req, res, next) => {
  const id = req.params.id

  knex(`notes`)
    .select(
      `notes.id`,
      `title`,
      `content`,
      `folders.id as folderId`,
      `folders.name as folderName`,
      `tags.id as tagId`,
      `tags.name as tagName`
    )
    .leftJoin(`folders`, `notes.folder_id`, `folders.id`)
    .leftJoin(`notes_tags`, `notes.id`, `note_id`)
    .leftJoin(`tags`, `tag_id`, `tags.id`)
    .where(`notes.id`, id)
    .then(results => {
      if (results[0]) res.json(hydrateNotes(results)[0])
      else next()
    })
    .catch(next)
})

// Put update an item
router.put(`/:id`, (req, res, next) => {
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
      if (`tags` in req.body) {
        return knex(`notes_tags`)
          .where(`note_id`, id)
          .del()
      }
    })
    .then(() => {
      if (`tags` in req.body) {
        const tagsInsert = req.body.tags.map(tagId => ({
          tag_id: tagId,
          note_id: id,
        }))
        return knex(`notes_tags`).insert(tagsInsert)
      }
    })
    .then(() => {
      return knex(`notes`)
        .select(
          `notes.id`,
          `title`,
          `content`,
          `folder_id`,
          `folders.name as folder_name`,
          `tags.id as tagId`,
          `tags.name as tagName`
        )
        .leftJoin(`folders`, `notes.folder_id`, `folders.id`)
        .leftJoin(`notes_tags`, `notes.id`, `note_id`)
        .leftJoin(`tags`, `tag_id`, `tags.id`)
        .where(`notes.id`, id)
    })
    .then(results => {
      if (results[0]) res.json(hydrateNotes(results)[0])
      else next()
    })
    .catch(next)
})

// Post (insert) an item
router.post(`/`, (req, res, next) => {
  const { title, content, folder_id, tags } = req.body

  const newItem = { title, content, folder_id }
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error(`Missing \`title\` in request body`)
    err.status = 400
    return next(err)
  }

  let noteId
  knex(`notes`)
    .insert(newItem, `id`)
    .then(([id]) => {
      noteId = id
      if (tags) {
        const tagsInsert = tags.map(tagId => ({
          note_id: noteId,
          tag_id: tagId,
        }))
        return knex(`notes_tags`).insert(tagsInsert)
      }
    })
    .then(() => {
      return knex(`notes`)
        .select(
          `notes.id`,
          `title`,
          `content`,
          `folders.id as folderId`,
          `folders.name as folderName`,
          `tags.id as tagId`,
          `tags.name as tagName`
        )
        .leftJoin(`folders`, `notes.folder_id`, `folders.id`)
        .leftJoin(`notes_tags`, `notes.id`, `note_id`)
        .leftJoin(`tags`, `tag_id`, `tags.id`)
        .where(`notes.id`, noteId)
    })
    .then(results => {
      if (results) {
        res
          .location(`${req.originalUrl}/${results.id}`)
          .status(201)
          .json(hydrateNotes(results)[0])
      } else next()
    })
    .catch(next)
})

// Delete an item
router.delete(`/:id`, (req, res, next) => {
  const id = req.params.id

  knex(`notes`)
    .where(`id`, id)
    .del()
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
