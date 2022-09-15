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

interface ListModel
    extends Model<
        InferAttributes<ListModel>,
        InferCreationAttributes<ListModel>
    > {
    id: CreationOptional<string>
    name: string
    description: CreationOptional<string>
}

const ListModel = sequelize.define<ListModel>('List', {
    id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
})

ListModel.sync({ alter: true })

export default ListModel
