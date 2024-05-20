import { Entity, PrimaryKey, Property, ManyToOne, PrimaryKeyProp, ManyToMany, Collection } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { ChallengeSet } from './challenge-set.entity.js';
import { Post } from './post.entity.js';

@Entity()
export class ChallengeLog {

    @PrimaryKey()
    date!: number;

    @ManyToOne({ primary: true })
    set!: ChallengeSet;

    @ManyToOne({ primary: true })
    user!: User;

    [PrimaryKeyProp]?: ['date', 'set', 'user'];

    @Property()
    weight!: number;

    @Property()
    reps!: number;

    @ManyToMany(() => Post, post => post.challenge_logs, { owner: true })
    posts = new Collection<Post>(this);
}