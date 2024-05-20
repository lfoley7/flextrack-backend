import { Entity, PrimaryKey, Property, OneToOne, OneToMany, ManyToMany, Cascade, Collection } from '@mikro-orm/core';
import { LoginCredential } from './login-credential.entity.js';
import { Exercise } from './exercise.entity.js';
import { FitnessProfile } from './fitness-profile.entity.js';
import { Post } from './post.entity.js';
import { WorkoutPlan } from './workout-plan.entity.js';
import { WorkoutLog } from './workout-log.entity.js';
import { Challenge } from './challenge.entity.js';
import { ChallengeInvite } from './challenge-invite.entity.js';
import { PostShare } from './post-share.entity.js';

@Entity()
export class User {

    @PrimaryKey()
    id!: number;

    @OneToOne()
    login!: LoginCredential;
    
    @OneToOne()
    profile!: FitnessProfile;

    @OneToMany(() => Exercise, exercise => exercise.user)
    exercises = new Collection<Exercise>(this);

    @OneToMany(() => Post, post => post.created_by)
    posts = new Collection<Post>(this);

    @ManyToMany(() => User)
    friends = new Collection<User>(this);

    @OneToMany(() => Challenge, challenge => challenge.owner)
    challenges = new Collection<Challenge>(this);

    @ManyToMany(() => Challenge, challenge => challenge.participants, { owner: true })
    participating_challenges = new Collection<Challenge>(this);

    @OneToMany(() => WorkoutPlan, plan => plan.user)
    plans = new Collection<WorkoutPlan>(this);

    @OneToMany(() => WorkoutLog, (log: WorkoutLog) => log.user, { cascade: [Cascade.ALL] })
    logs = new Collection<WorkoutLog>(this);

    @OneToMany(() => ChallengeInvite, invite => invite.recipient)
    challenge_invites = new Collection<ChallengeInvite>(this);

    @OneToMany(() => ChallengeInvite, invite => invite.inviter)
    challenge_sent_invites = new Collection<ChallengeInvite>(this);

    @OneToMany(() => PostShare, share => share.sharer)
    shared_posts = new Collection<PostShare>(this);

    @OneToMany(() => PostShare, share => share.recipient)
    recieved_posts = new Collection<PostShare>(this);

    constructor(username: string, login: LoginCredential, profile: FitnessProfile=new FitnessProfile(username)) {
        this.login = login;
        this.profile = profile;
    }
}