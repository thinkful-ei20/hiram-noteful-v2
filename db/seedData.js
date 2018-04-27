const knex = require(`../knex`)
const util = require(`util`)
const exec = util.promisify(require(`child_process`).exec)

module.exports = function(file, user = `shark`) {
  return exec(
    `psql -U ${user} -f ${file} ${knex.client.connectionSettings.database}`
  )
}
