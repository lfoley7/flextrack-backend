import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Cascade, Collection, PrimaryKeyProp } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { Challenge } from './challenge.entity.js';

@Entity()
export class ChallengeInvite {

    @ManyToOne({ primary: true })
    recipient!: User;

    @ManyToOne({ primary: true })
    challenge!: Challenge;

    @ManyToOne({ primary: true })
    inviter!: User;

    [PrimaryKeyProp]?: ['recipient', 'challenge', 'inviter'];
    
}