import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './user.entity.js';
import bcrypt from 'bcrypt';

@Entity()
export class LoginCredential {

    @PrimaryKey()
    email!: string;
  
    @Property()
    password!: string;
  
    @OneToOne(() => User, user => user.login, { orphanRemoval: true })
    user!: User;

    private constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }

    public static async create(email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);

        return new LoginCredential(email, hashedPassword);
    } 
}