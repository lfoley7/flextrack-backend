import { Entity, PrimaryKey, Property, ManyToOne, PrimaryKeyProp, Collection, OneToMany, Cascade } from '@mikro-orm/core';
import { WorkoutPlan } from './workout-plan.entity.js';
import { SessionSet } from './set.entity.js';

@Entity()
export class WorkoutSession {

    @PrimaryKey()
    day_of_week!: string;

    @PrimaryKey()
    workout_type!: string;

    @ManyToOne({ primary: true })
    plan!: WorkoutPlan;

    @OneToMany(() => SessionSet, (session_set: SessionSet) => session_set.session, { cascade: [Cascade.ALL] })
    sets = new Collection<SessionSet>(this);

    [PrimaryKeyProp]?: ['day_of_week', 'workout_type', 'plan'];

    public constructor(day_of_week: string, workout_type: string, workout_plan: WorkoutPlan, sets: SessionSet[]) {
        this.day_of_week = day_of_week;
        this.workout_type = workout_type;
        this.plan = workout_plan;
        this.addSets(sets);
    }

    public addSets(sets: SessionSet[]) {
        sets.forEach((set) => {
            this.sets.add(set)
            set.session = this;
        });
    } 
}