import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import { initORM } from '../db.js';
import { User } from '../entities/user.entity.js';
import { ChallengeSet } from '../entities/challenge-set.entity.js';
import { Challenge } from '../entities/challenge.entity.js';
import { Post } from '../entities/post.entity.js';
import { Comment } from '../entities/comments.entity.js';
import { WorkoutSession } from '../entities/workout-session.entity.js';
import { SessionSet } from '../entities/set.entity.js';
import { LoginCredential } from '../entities/login-credential.entity.js';
import { FitnessProfile } from '../entities/fitness-profile.entity.js';

const router = Router();

async function initializeRouter() {
    const db = await initORM();

    // User routes
    router.post("/user/signup", async (req, res) => {
        const { username, email, password } = req.body;

        try {

            const userCount = await db.em.count(LoginCredential, { email: email });

            // If the user exists
            if (userCount > 0) {
                res.status(400).json({ error: 'An account with that email already exists' });
                return
            }

            // Create the user
            const loginCredentials = await LoginCredential.create(email, password);
            const newUser = new User(username, loginCredentials);

            await db.em.persistAndFlush(loginCredentials);
            await db.em.persistAndFlush(newUser);

            //Set userId session cookie
            req.session.userId = newUser.id.toString();

            res.status(200).json({ user: newUser });
        } catch (error) {
            console.error('Error creating user and credentials:', error);
            res.status(500).json({ error: 'Failed to signup user' });
        }
    });

    router.post("/user/login", async (req, res) => {
        const { email, password } = req.body;
        const errorMsg = 'Invalid email or password';

        try {
            // Find the corresponding credentials
            const credentials = await db.em.findOne(LoginCredential, { email: email });

            // If the credentials don't exist
            if (!credentials) {
                res.status(400).json({ error: errorMsg });
                return
            }

            // Compare the provided password with the stored hashed password
            const passwordMatch = await bcrypt.compare(password, credentials.password);

            if (!passwordMatch) {
                res.status(400).json({ error: errorMsg });
                return
            }

            // Passwords match, user is authenticated
            // Set session variable
            req.session.userId = credentials.user.id.toString();
            res.json({ message: 'Login successful' });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    router.get('/user/logout', async (req, res) => {
        try {
            req.session.destroy(() => { });
        } catch (error) {
            console.error('Error during logout user:', error);
            res.status(500).json({ error: 'Failed to logout user' });
        }
    });

    router.post("/user/add-friend", async (req, res) => {
        let userId = "";
        const errorMsg = 'Failed to add friend'
        const friendId = req.body.id;

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: errorMsg })
            return;
        }
        const user: User | null = await db.user.findOne({ id: +userId }, { populate: ['friends'] });
        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return;
        }

        const friend: User | null = await db.user.findOne({ id: friendId });
        if (friend === null) {
            console.error(`Friend with id ${friendId} not found`);
            res.status(404).json({ error: `Friend with id ${friendId} not found` });
            return;
        }

        try {
            user.friends.add(friend);
            await db.em.persistAndFlush(user);
            res.status(200).json(user.profile);
        } catch (error) {
            console.error(errorMsg + ':', error);
            res.status(500).json({ error: errorMsg });
        }
    });

    router.get("/user/get-all-friends", async (req, res) => {
        let userId = "";
        const errorMsg = 'Failed to get users'

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: errorMsg });
        }

        const user = await db.user.findOne({ id: +userId }, { populate: ['friends.profile.username'] });
        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        } else {
            try {
                res.status(200).json(user.friends);
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
            }
        }
    });

    // Exercise routes
    router.get("/exercise/get-all", async (req, res) => {
        let userId = "";

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: 'Failed to get exercises' });
        }
        const user = await db.user.findOne({ id: +userId }, { populate: ['exercises'] });

        if (user == null) {
            console.error('Error getting exercises');
            res.status(500).json({ error: 'Failed to get exercises' });
        } else {
            try {
                res.status(200).json(user.exercises);
            } catch (error) {
                console.error('Error getting exercises:', error);
                res.status(500).json({ error: 'Failed to get exercises' });
            }
        }
    });

    router.post("/exercise/create", async (req, res) => {
        const { name, targetMuscle } = req.body;

        let userId = "";

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: 'Failed to get exercises' });
        }

        const user = await db.user.findOne({ id: +userId });

        if (user == null) {
            console.error('Error creating exercise');
            res.status(500).json({ error: 'Error creating exercise' });
        } else {
            try {
                const exercise = db.exercise.create({ name: name, targetMuscle: targetMuscle, user: user });
                await db.em.persistAndFlush(exercise);
                res.status(200).json({ exercise: exercise });
            } catch (error) {
                console.error('Error creating exercise:', error);
                res.status(500).json({ error: 'Error creating exercise' });
            }
        }
    });

    router.delete("/exercise/delete", async (req, res) => {
        let userId = "";

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: 'Failed to get exercises' });
        }

        const user = await db.user.findOne({ id: +userId });

        if (user == null) {
            console.error('Error creating exercise');
            res.status(500).json({ error: 'Error creating exercise' });
        } else {
            try {
                if (req.query.id != null) {
                    const exercise = db.exercise.nativeDelete({ id: +req.query.id });
                    res.status(200).json({ exercise: exercise });
                } else {
                    console.error('Error deleting exercise');
                    res.status(500).json({ error: 'Error deleting exercise' });
                }
            } catch (error) {
                console.error('Error creating exercise:', error);
                res.status(500).json({ error: 'Error creating exercise' });
            }
        }
    });

    // Workout routes
    router.get("/workout/get-all", async (req, res) => {
        let userId = "";

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: 'Failed to get plans' });
        }
        const user = await db.user.findOne({ id: +userId }, { populate: ['plans.sessions', 'plans.sessions.sets'] });

        if (user == null) {
            console.error('Error getting plans');
            res.status(500).json({ error: 'Failed to get plans' });
        } else {
            try {
                res.status(200).json(user.plans);
            } catch (error) {
                console.error('Error getting plans:', error);
                res.status(500).json({ error: 'Failed to get plans' });
            }
        }
    });

    router.post("/workout/create", async (req, res) => {
        const { name, sessions } = req.body;
        console.log(req.body)
        let userId = "";

        if (req.session.userId) {
            userId = req.session.userId;
        } else {
            console.error('Error creating plan');
            res.status(500).json({ error: 'Failed to get plans' });
            return
        }

        const user = await db.user.findOne({ id: +userId });

        if (user == null) {
            console.error('Error creating plan');
            res.status(500).json({ error: 'Error creating plan' });
            return
        } else {
            try {
                const plan = db.workoutPlan.create({ name: name, user: user });
                if (sessions) {
                    const workoutSessions = await Promise.all<WorkoutSession>(sessions.map(async (session: {
                        sets: any; day_of_week: string; workout_type: string;
                    }) => {
                        const sets = await Promise.all<SessionSet>(session.sets.map(
                            async (set: {
                                set_number: number,
                                exercise_id: number,
                                target_weight: number,
                                target_reps: number
                            }) => {
                                const exercise = await db.exercise.findOne({ id: set.exercise_id });
                                if (exercise == null) {
                                    throw new Error("Exercise not found");

                                } else {
                                    return new SessionSet(set.set_number, exercise, set.target_weight, set.target_reps)
                                }
                            }))
                        console.log(sets)
                        return new WorkoutSession(session.day_of_week, session.workout_type, plan, sets)
                    }))

                    plan.addSessions(workoutSessions)
                }

                await db.em.persistAndFlush(plan);
                res.status(200).json({ plan: plan });
                return
            } catch (error) {
                console.error('Error creating plan:', error);
                res.status(500).json({ error: 'Error creating plan' });
                return
            }
        }
    });

    router.post("/workout/add-sessions", async (req, res) => {
        const { sessions, plan_id } = req.body;
        const errorMsg = 'Error adding sessions to plan'
        let userId = "";
        console.log(sessions);
        console.log(plan_id)
        if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: errorMsg });
        }

        const user = await db.user.findOne({ id: +userId }, { populate: ['plans.sessions'] });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        } else {
            try {
                const plan = user.plans.find((plan: { id: any; }) => { return plan.id == plan_id })
                if (plan == null) {
                    console.error(errorMsg);
                    res.status(500).json({ error: errorMsg });
                } else {
                    const workoutSessions = await Promise.all<WorkoutSession>(sessions.map(async (session: {
                        sets: any; day_of_week: string; workout_type: string;
                    }) => {

                        const sets = await Promise.all<SessionSet>(session.sets.map(
                            async (set: {
                                set_number: number,
                                exercise_id: number,
                                target_weight: number,
                                target_reps: number
                            }) => {

                                const exercise = await db.exercise.findOne({ id: set.exercise_id });
                                if (exercise == null) {
                                    throw new Error("Exercise not found");

                                } else {
                                    return new SessionSet(set.set_number, exercise, set.target_weight, set.target_reps)
                                }
                            }))
                        console.log(sets)
                        return new WorkoutSession(session.day_of_week, session.workout_type, plan, sets)
                    }))

                    plan.addSessions(workoutSessions)
                    await db.em.persistAndFlush(plan);
                    res.status(200).json({ plan: plan });
                }
            } catch (error) {
                console.error('Error adding sessions to plan:', error);
                res.status(500).json({ error: errorMsg });
            }
        }
    });

    router.delete("/workout/delete", async (req, res) => {
        let userId = "";

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: 'Failed to delete plan' });
        }

        const user = await db.user.findOne({ id: +userId });

        if (user == null) {
            console.error('Error deleting plan');
            res.status(500).json({ error: 'Error deleting plan' });
        } else {
            try {
                if (req.query.id != null) {
                    const plan = db.workoutPlan.nativeDelete({ id: +req.query.id });
                    res.status(200).json({ plan: plan });
                } else {
                    console.error('Error deleting plan');
                    res.status(500).json({ error: 'Error deleting plan' });
                }
            } catch (error) {
                console.error('Error creating plan:', error);
                res.status(500).json({ error: 'Error creating plan' });
            }
        }
    });

    router.post("/workout/update-name", async (req, res) => {
        const { name, id } = req.body;
        const errorMsg = 'Error updating plan name'
        console.log(req.body)
        let userId = "";

        if (req.session.userId) {
            userId = req.session.userId;
        } else {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        }

        const user = await db.user.findOne({ id: +userId });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        } else {
            try {
                const plan = await db.workoutPlan.findOne({ id: id });

                if (plan == null) {
                    console.error(errorMsg);
                    res.status(500).json({ error: errorMsg });
                    return
                }
                plan.name = name;
                await db.em.persistAndFlush(plan);
                res.status(200).json({ plan: plan });
                return
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
                return
            }
        }
    });

    router.get("/workout/get", async (req, res) => {
        const errorMsg = 'Error getting plan'
        console.log(req.body)
        let userId = "";

        if (req.session.userId) {
            userId = req.session.userId;
        } else {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        }

        let plan_id;
        if (req.query.id) {
            plan_id = req.query.id;
        } else {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        }

        let sessionType = "";
        if (req.query.session) {
            sessionType = req.query.session + "";
        } else {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        }


        let day = "";
        if (req.query.day) {
            day = req.query.day + "";
        } else {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        }

        const user = await db.user.findOne({ id: +userId });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        } else {
            try {
                const plan = await db.workoutPlan.findOne({ id: +plan_id }, { populate: ['sessions', 'sessions.sets'] });
                if (plan == null) {
                    console.error(errorMsg);
                    res.status(500).json({ error: errorMsg });
                    return
                }
                const session = await db.workoutSession.findOne({ plan: plan, workout_type: sessionType, day_of_week: day },
                    { populate: ['plan.name', 'sets', 'sets.exercise.*', 'sets.set_number', 'sets.target_reps', 'sets.target_weight'] });
                if (session == null) {
                    console.error(errorMsg);
                    res.status(500).json({ error: errorMsg });
                    return
                }

                const exercises = new Map<string, object[]>()

                session.sets.map((set: SessionSet) => {
                    console.log(set.exercise.name)
                    if (exercises.has(set.exercise.name)) {

                        const current = exercises.get(set.exercise.name);

                        if (current) {
                            current?.push({ reps: set.target_reps, weight: set.target_weight, completed: false })
                            console.log(current)
                            exercises.set(set.exercise.name, current)
                        }

                    } else {
                        const current = new Array();
                        current.push({ reps: set.target_reps, weight: set.target_weight, completed: false });
                        console.log(current)
                        exercises.set(set.exercise.name, current)
                    }
                })

                const exerciseArray = [...exercises].map(([name, sets]) => ({ name, sets }));

                res.status(200).json({ session: session, exercises: exerciseArray });
                return
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
                return
            }
        }
    });

    router.get("/workout/get-plan", async (req, res) => {
        const errorMsg = 'Error getting plan'
        console.log(req.body)
        let userId = "";

        if (req.session.userId) {
            userId = req.session.userId;
        } else {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        }

        let plan_id;
        if (req.query.id) {
            plan_id = req.query.id;
        } else {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        }

        const user = await db.user.findOne({ id: +userId });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        } else {
            try {
                const plan = await db.workoutPlan.findOne({ id: +plan_id }, { populate: ['sessions', 'sessions.sets'] });
                if (plan == null) {
                    console.error(errorMsg);
                    res.status(500).json({ error: errorMsg });
                    return
                }

                res.status(200).json({ plan: plan });
                return
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
                return
            }
        }
    });

    // Profile routes
    router.get("/profile/get-all", async (req, res) => {
        let userId = "";
        const errorMsg = 'Failed to get profiles'

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: errorMsg });
        }
        const user: User | null = await db.user.findOne({ id: +userId }, { populate: ['profile', 'friends'] });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        } else {
            try {
                const profiles = await db.profile.findAll();
                const filteredProfiles = profiles.filter((profile) => { return profile != user.profile })

                const friendProfiles = filteredProfiles.map((profile: FitnessProfile) => {
                    let friend = user.friends.contains(profile.user);
                    return { ...profile, friend: friend };
                })
                console.log(friendProfiles);
                res.status(200).json(friendProfiles);
                return
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
            }
        }
    });

    router.get("/profile/get", async (req, res) => {
        let userId = "";
        const errorMsg = 'Failed to get profile'

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: errorMsg });
        }
        const user: User | null = await db.user.findOne({ id: +userId }, { populate: ['profile'] });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        } else {
            try {
                res.status(200).json(user.profile);
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
            }
        }
    });

    router.post("/profile/update", async (req, res) => {
        let userId = "";
        const errorMsg = 'Failed to update profile'
        const { username, height, weight, deadlift, squat, ohp, bench, description } = req.body;

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: errorMsg });
        }
        const user: User | null = await db.user.findOne({ id: +userId }, { populate: ['profile'] });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        } else {
            try {

                user.profile.username = username ? username : username.profile.height;
                user.profile.height = height ? height : user.profile.height;
                user.profile.weight = weight ? weight : user.profile.weight;
                user.profile.deadlift = deadlift ? deadlift : user.profile.deadlift;
                user.profile.squat = squat ? squat : user.profile.squat;
                user.profile.ohp = ohp ? ohp : user.profile.ohp;
                user.profile.bench = bench ? bench : user.profile.bench;
                user.profile.description = description ? description : user.profile.description;

                await db.em.persistAndFlush(user);
                res.status(200).json(user.profile);
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
            }
        }
    });

    // Post routes
    router.get("/post/get-all", async (req, res) => {
        const errorMsg = 'Failed to get posts'

        const posts: Post[] = await db.post.findAll({ populate: ['created_by.profile.username', 'comments.created_by.profile.username'] });

        if (posts == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        } else {
            try {
                posts.sort((a, b) => {
                    if (a.date > b.date) {
                        return 1;
                    } else if (a.date < b.date) {
                        return -1;
                    } else {
                        return 0;
                    }
                })
                res.status(200).json(posts);
                return
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
            }
        }
    });

    router.post("/post/create", async (req, res) => {
        const errorMsg = 'Failed to create post'
        const { title, caption, date } = req.body;

        let userId = "";

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: errorMsg });
        }

        const user = await db.user.findOne({ id: +userId });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        } else {
            try {
                const post = db.post.create({ title: title, caption: caption, date: date, created_by: user });
                await db.em.persistAndFlush(post);
                res.status(200).json({ post: post });
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
            }
        }
    });

    router.post("/post/add-comment", async (req, res) => {
        const errorMsg = 'Failed to add comments to post'
        const { postId, caption, date } = req.body;

        let userId = "";

        if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: errorMsg });
        }

        const user = await db.user.findOne({ id: +userId });
        const post = await db.post.findOne({ id: +postId }, { populate: ['comments'] });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        }
        else if (post == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        } else {
            try {
                const comment = new Comment(post, caption, date, user);
                post.comments.add(comment)
                await db.em.persistAndFlush(post);
                res.status(200).json({ post: post });
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
            }
        }
    });

    // Challenge routes
    router.get("/challenge/get-all", async (req, res) => {
        let userId = "";
        const errorMsg = 'Error getting challenges';

        if (req.query.id) {
            userId = (req.query.id).toString();
        } else if (req.session.userId) {
            userId = req.session.userId;
        } else {
            res.status(500).json({ error: errorMsg });
        }
        const user = await db.user.findOne({ id: +userId }, { populate: ['challenges.sets.exercise', 'participating_challenges.sets.exercise'] });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
        } else {
            try {

                const challenges: any[] = user.challenges.getItems().concat(user.participating_challenges.getItems())
                const formattedChallenges = new Map()
                for (const challenge of challenges) {

                    const exercises = new Map<string, object[]>()

                    challenge.sets.map((set: ChallengeSet) => {
                        console.log(set.exercise.name)
                        if (exercises.has(set.exercise.name)) {

                            const current = exercises.get(set.exercise.name);

                            if (current) {
                                current?.push({ reps: set.target_reps, weight: set.target_weight, completed: false })
                                console.log(current)
                                exercises.set(set.exercise.name, current)
                            }

                        } else {
                            const current = new Array();
                            current.push({ id: set.set_number, reps: set.target_reps, weight: set.target_weight, completed: false });
                            console.log(current)
                            exercises.set(set.exercise.name, current)
                        }
                    })

                    const exerciseArray = [...exercises].map(([name, sets]) => ({ name, sets }));
                    challenge.exercises = exerciseArray;
                    formattedChallenges.set(challenge.id, exerciseArray);
                }
                console.log(challenges);
                console.log(formattedChallenges);
                const exerciseArray = [...formattedChallenges].map(([id, exercises]) => ({ id, exercises }));
                res.status(200).json({ challenges: challenges, exercises: exerciseArray });
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
            }
        }
    });

    router.post("/challenge/create", async (req, res) => {
        const { users, sets, name } = req.body;
        const errorMsg = 'Error adding sessions to plan'
        console.log(req.body)
        let userId = "";

        if (req.session.userId) {
            userId = req.session.userId;
        } else {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        }

        const user = await db.user.findOne({ id: +userId });

        if (user == null) {
            console.error(errorMsg);
            res.status(500).json({ error: errorMsg });
            return
        } else {
            try {

                const newSets = await Promise.all<ChallengeSet>(sets.map(
                    async (set: {
                        set_number: number,
                        exercise_id: number,
                        target_weight: number,
                        target_reps: number
                    }) => {

                        const exercise = await db.exercise.findOne({ id: set.exercise_id });
                        if (exercise == null) {
                            throw new Error("Exercise not found");

                        } else {
                            return new ChallengeSet(set.set_number, exercise, set.target_weight, set.target_reps)
                        }
                    }))

                const challenge = new Challenge(newSets, name, user)
                user.challenges.add(challenge);

                for (const curUserId of users) {
                    const curUser = await db.user.findOne({ id: +curUserId });
                    if (curUser == null) {
                        continue
                    }

                    curUser.participating_challenges.add(challenge)
                    await db.em.persistAndFlush(curUser);
                }
                await db.em.persistAndFlush(user);
                res.status(200).json({ challenge: challenge });
                return
            } catch (error) {
                console.error(errorMsg + ':', error);
                res.status(500).json({ error: errorMsg });
                return
            }
        }
    });

    return router;
}

export default initializeRouter;
