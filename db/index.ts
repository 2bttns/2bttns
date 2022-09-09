import { Sequelize } from 'sequelize'
import config from './config'

export const sequelize = new Sequelize(config)

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.')
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error)
    })
