import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Cascade, Collection, PrimaryKeyProp } from '@mikro-orm/core';
import { User } from './user.entity.js';
import { Post } from './post.entity.js';

@Entity()
export class PostShare {

    @ManyToOne({ primary: true })
    recipient!: User;

    @ManyToOne({ primary: true })
    post!: Post;

    @ManyToOne({ primary: true })
    sharer!: User;

    [PrimaryKeyProp]?: ['recipient', 'post', 'sharer'];
    
}