import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, Collection, OneToMany, PrimaryKeyProp } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { Post } from './post.entity.js';

@Entity()
export class Comment {

    @PrimaryKey()
    id!: number;

    @Property()
    caption!: string;

    @Property()
    date!: Date;

    @ManyToOne({ primary: true })
    post!: Post;

    [PrimaryKeyProp]?: ['id', 'post'];

    @ManyToOne()
    created_by!: User;

    constructor(post: Post, caption: string, date: Date, user: User) {
        this.id = post.comments.length;
        this.post = post;
        this.caption = caption;
        this.date = date;
        this.created_by = user;
    }
}