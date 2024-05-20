import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Cascade, Collection, ManyToMany } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { WorkoutSession } from './workout-session.entity.js';
import { Post } from './post.entity.js';

@Entity()
export class WorkoutPlan {

    @PrimaryKey()
    id!: number;
  
    @Property()
    name!: string;

    @ManyToOne()
    user!: User;

    @OneToMany(() => WorkoutSession, session => session.plan, { cascade: [Cascade.ALL] })
    sessions = new Collection<WorkoutSession>(this);

    @ManyToMany(() => Post, post => post.plans, { owner: true })
    posts = new Collection<Post>(this);

    public addSessions(sessions: WorkoutSession[]) {
        sessions.forEach((session) => {
            this.sessions.add(session)
            session.plan = this;
        });
    } 
}