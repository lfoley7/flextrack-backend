import { Entity, PrimaryKey, Property, ManyToOne, Collection, OneToMany, Cascade } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { SessionSet } from './set.entity.js';
import { ChallengeSet } from './challenge-set.entity.js';

@Entity()
export class Exercise {

    @PrimaryKey()
    id!: number;
  
    @Property()
    name!: string;

    @Property()
    targetMuscle!: string;

    @ManyToOne()
    user!: User;

    @OneToMany(() => SessionSet, (session_set: SessionSet) => session_set.exercise, { cascade: [Cascade.ALL] })
    sets = new Collection<SessionSet>(this);

    @OneToMany(() => ChallengeSet, (challenge_set: ChallengeSet) => challenge_set.exercise, { cascade: [Cascade.ALL] })
    challenge_sets = new Collection<ChallengeSet>(this);
}