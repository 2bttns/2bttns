import path from 'path'
import { SequelizeOptions } from 'sequelize-typescript'

const config: SequelizeOptions = {
    dialect: 'sqlite',

    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,

    storage: path.resolve('db/database.sqlite'),
}

export default config
