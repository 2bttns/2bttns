import path from 'path'
import { SequelizeOptions } from 'sequelize-typescript'

const sqliteFileName =
    process.env.NODE_ENV === 'production' ? 'db-prod.sqlite' : 'db-dev.sqlite'
const sqlitePath = path.resolve(sqliteFileName)
console.log(`SQLite Path: ${sqlitePath}`)

const config: SequelizeOptions = {
    dialect: 'sqlite',

    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,

    storage: sqlitePath,
    logging: false,
}

export default config
