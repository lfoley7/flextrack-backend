import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, Collection, OneToMany } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { Challenge } from './challenge.entity.js';
import { WorkoutPlan } from './workout-plan.entity.js';
import { WorkoutLog } from './workout-log.entity.js';
import { ChallengeLog } from './challenge-log.entity.js';
import { PostShare } from './post-share.entity.js';
import { Comment } from './comments.entity.js';

@Entity()
export class Post {

    @PrimaryKey()
    id!: number;
  
    @Property()
    title!: string;

    @Property()
    caption!: string;

    @Property()
    date!: Date;

    @ManyToOne()
    created_by!: User;

    @ManyToMany(() => Challenge, challenge => challenge.posts)
    challenges = new Collection<Challenge>(this);

    @ManyToMany(() => WorkoutPlan, plan => plan.posts)
    plans = new Collection<WorkoutPlan>(this);

    @ManyToMany(() => WorkoutLog, log => log.posts)
    workout_logs = new Collection<WorkoutLog>(this);
    
    @ManyToMany(() => ChallengeLog, log => log.posts)
    challenge_logs = new Collection<ChallengeLog>(this);

    @OneToMany(() => PostShare, share => share.post)
    shares = new Collection<PostShare>(this);

    @OneToMany(() => Comment, comment => comment.post)
    comments = new Collection<Comment>(this);
}