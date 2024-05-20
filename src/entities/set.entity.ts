import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Cascade, Collection, PrimaryKeyProp } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { WorkoutSession } from './workout-session.entity.js';
import { Exercise } from './exercise.entity.js';
import { WorkoutLog } from './workout-log.entity.js';

@Entity()
export class SessionSet {

    @PrimaryKey()
    set_number!: number;

    @ManyToOne({ primary: true })
    session!: WorkoutSession;

    @ManyToOne({ primary: true })
    exercise!: Exercise;

    [PrimaryKeyProp]?: ['set_number', 'session', 'exercise'];

    @Property()
    target_weight!: number;

    @Property()
    target_reps!: number;

    @OneToMany(() => WorkoutLog, (log: WorkoutLog) => log.set, { cascade: [Cascade.ALL] })
    logs = new Collection<WorkoutLog>(this);

    public constructor(set_number: number, exercise: Exercise, target_weight: number, target_reps: number) {
        this.set_number = set_number;
        this.exercise = exercise;
        this.target_weight = target_weight;
        this.target_reps = target_reps;
    }

    public addSession(session: WorkoutSession) {
        this.session = session;
    } 
}