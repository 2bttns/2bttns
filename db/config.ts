import path from 'path'
import { Options } from 'sequelize'

const config: Options = {
    dialect: 'sqlite',

    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,

    storage: path.resolve('db/database.sqlite'),
    logging: console.log,
}

export default config
