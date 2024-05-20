import { EntityManager, EntityRepository, MikroORM, Options } from '@mikro-orm/sqlite';
import { User } from './entities/user.entity.js';
import { LoginCredential } from './entities/login-credential.entity.js';
import { Exercise } from './entities/exercise.entity.js';
import { WorkoutPlan } from './entities/workout-plan.entity.js';
import { WorkoutLog } from './entities/workout-log.entity.js';
import { WorkoutSession } from './entities/workout-session.entity.js';
import { Challenge } from './entities/challenge.entity.js';
import { ChallengeLog } from './entities/challenge-log.entity.js';
import { ChallengeSet } from './entities/challenge-set.entity.js';
import { ChallengeInvite } from './entities/challenge-invite.entity.js';
import { FitnessProfile } from './entities/fitness-profile.entity.js';
import { Post } from './entities/post.entity.js';
import { PostShare } from './entities/post-share.entity.js';
import { SessionSet } from './entities/set.entity.js';
import { Comment } from './entities/comments.entity.js';

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  loginCredential: EntityRepository<LoginCredential>;
  user: EntityRepository<User>;
  exercise: EntityRepository<Exercise>;
  workoutPlan: EntityRepository<WorkoutPlan>;
  workoutLog: EntityRepository<WorkoutLog>;
  workoutSession: EntityRepository<WorkoutSession>;
  workoutSet: EntityRepository<SessionSet>;
  challenge: EntityRepository<Challenge>;
  challengeLog: EntityRepository<ChallengeLog>;
  challengeSet: EntityRepository<ChallengeSet>;
  challengeInvite: EntityRepository<ChallengeInvite>;
  profile: EntityRepository<FitnessProfile>;
  post: EntityRepository<Post>;
  postShare: EntityRepository<PostShare>;
  comment: EntityRepository<Comment>;
}

let cache: Services;

export async function initORM(options?: Options): Promise<Services> {
  if (cache) {
    return cache;
  }

  const orm = await MikroORM.init(options);

  // save to cache before returning
  return cache = {
    orm,
    em: orm.em,
    loginCredential: orm.em.getRepository(LoginCredential),
    user: orm.em.getRepository(User),
    exercise: orm.em.getRepository(Exercise),
    workoutPlan: orm.em.getRepository(WorkoutPlan),
    workoutLog: orm.em.getRepository(WorkoutLog),
    workoutSession: orm.em.getRepository(WorkoutSession),
    workoutSet: orm.em.getRepository(SessionSet),
    challenge: orm.em.getRepository(Challenge),
    challengeLog: orm.em.getRepository(ChallengeLog),
    challengeSet: orm.em.getRepository(ChallengeSet),
    challengeInvite: orm.em.getRepository(ChallengeInvite),
    profile: orm.em.getRepository(FitnessProfile),
    post: orm.em.getRepository(Post),
    postShare: orm.em.getRepository(PostShare),
    comment: orm.em.getRepository(Comment),
  };
}