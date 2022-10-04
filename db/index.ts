import { Sequelize } from 'sequelize-typescript'
import config from './config'
import ListItemModel from './models/ListItemModel'
import ListModel from './models/ListModel'
import UserModel from './models/UserModel'
export { UserModel, ListModel, ListItemModel }

export const sequelize = new Sequelize(config)
sequelize.addModels([UserModel, ListModel, ListItemModel])

export async function initDb() {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })
}
