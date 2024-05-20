import { Entity, PrimaryKey, Property, ManyToOne, PrimaryKeyProp, ManyToMany, Collection } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { SessionSet } from './set.entity.js';
import { Post } from './post.entity.js';

@Entity()
export class WorkoutLog {

    @PrimaryKey()
    date!: number;

    @ManyToOne({ primary: true })
    set!: SessionSet;

    @ManyToOne({ primary: true })
    user!: User;

    [PrimaryKeyProp]?: ['date', 'set', 'user'];

    @Property()
    weight!: number;

    @Property()
    reps!: number;

    @ManyToMany(() => Post, post => post.workout_logs, { owner: true })
    posts = new Collection<Post>(this);
}