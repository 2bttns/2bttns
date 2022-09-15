import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    UUID,
    UUIDV4,
} from 'sequelize'
import { sequelize } from '../..'
import ListModel from './ListModel'

interface ListItemModel
    extends Model<
        InferAttributes<ListItemModel>,
        InferCreationAttributes<ListItemModel>
    > {
    id: CreationOptional<string>
    list_id: string
    name: string
    description: CreationOptional<string>
}

const ListItemModel = sequelize.define<ListItemModel>('ListItem', {
    id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    list_id: {
        type: UUID,
    },
    name: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
})

ListModel.hasMany(ListItemModel, {
    foreignKey: 'list_id',
    onDelete: 'CASCADE',
})
ListItemModel.belongsTo(ListModel)

ListItemModel.sync({ alter: true })

export default ListItemModel
