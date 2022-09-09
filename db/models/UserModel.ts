import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    UUID,
    UUIDV4,
} from 'sequelize'
import { sequelize } from '..'

interface UserModel
    extends Model<
        InferAttributes<UserModel>,
        InferCreationAttributes<UserModel>
    > {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
    id: CreationOptional<string>
    name: string
}

const UserModel = sequelize.define<UserModel>('User', {
    id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
    },
})

UserModel.sync()

export default UserModel