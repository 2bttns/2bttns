import { Sequelize } from 'sequelize-typescript'
import config from './config'
import ListItemModel from './models/example/ListItemModel'
import ListModel from './models/example/ListModel'
import UserModel from './models/example/UserModel'

export const sequelize = new Sequelize(config)
export { UserModel, ListModel, ListItemModel }

sequelize.addModels([UserModel, ListModel, ListItemModel])

sequelize
    .authenticate()
    .then(() => {
        sequelize.sync({ alter: true })
        console.log('Connection has been established successfully.')
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error)
    })
