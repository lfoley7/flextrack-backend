import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, OneToMany, Cascade, Collection } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { WorkoutSession } from './workout-session.entity.js';
import { ChallengeSet } from './challenge-set.entity.js';
import { Post } from './post.entity.js';
import { ChallengeInvite } from './challenge-invite.entity.js';

@Entity()
export class Challenge {

    @PrimaryKey()
    id!: number;
  
    @Property()
    name!: string;

    @Property()
    description!: string;

    @Property()
    start!: Date;

    @Property()
    end!: Date;

    @Property()
    status!: string;

    @ManyToOne()
    owner!: User;

    @ManyToMany(() => User, user => user.participating_challenges)
    participants = new Collection<User>(this);

    @OneToMany(() => ChallengeSet, set => set.challenge, { cascade: [Cascade.ALL] })
    sets = new Collection<ChallengeSet>(this);

    @ManyToMany(() => Post, post => post.challenges, { owner: true })
    posts = new Collection<Post>(this);

    @OneToMany(() => ChallengeInvite, invite => invite.challenge)
    invites = new Collection<ChallengeInvite>(this);

    constructor (sets: ChallengeSet[], name: string, owner: User) {
        this.addSets(sets);
        this.name = name;
        this.owner = owner;
        this.description = '';
        this.start = new Date();
        this.end = new Date();
        this.status = 'In Progress'
    }

    private addSets(sets: ChallengeSet[]) {
        sets.forEach((set) => {
            this.sets.add(set)
            set.addChallenge(this);
        });
    } 
}