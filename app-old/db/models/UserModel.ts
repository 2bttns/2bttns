import { Optional, UUIDV4 } from 'sequelize'
import { Column, Default, Model, PrimaryKey, Table } from 'sequelize-typescript'

export interface UserAttributes {
    id: string
    name?: string
}

export interface UserCreationAttributes
    extends Optional<UserAttributes, 'id' | 'name'> {}

@Table({ tableName: 'users', timestamps: false })
class UserModel extends Model<UserAttributes, UserCreationAttributes> {
    @Default(UUIDV4)
    @PrimaryKey
    @Column
    id: string

    @Column
    name: string
}

export default UserModel
