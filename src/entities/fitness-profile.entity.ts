import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './user.entity.js';

@Entity()
export class FitnessProfile {

    @PrimaryKey()
    id!: number;
  
    @Property()
    username!: string;

    @Property()
    height!: number;
  
    @Property()
    weight!: number;

    @Property()
    deadlift!: number;

    @Property()
    squat!: number;

    @Property()
    ohp!: number;
  
    @Property()
    bench!: number;

    @Property()
    description!: string;

    @OneToOne(() => User, user => user.profile, { orphanRemoval: true })
    user!: User;

    public constructor(username: string) {
        this.username = username;
        this.height = 0;
        this.weight = 0;
        this.deadlift = 0;
        this.squat = 0;
        this.ohp = 0;
        this.bench = 0;
        this.description = "I just joined Flextrack!";
    }
}