import { RequestHandler } from 'express-serve-static-core';
import { db } from '../datastore';
import { Post } from '../types';
import crypto from 'crypto';

// Re-using your types
export type ExpressHandler<Req, Res> = RequestHandler<string, Partial<Res>, Partial<Req>, any>;
type createPostRequest = Pick<Post, 'title' | 'url' | 'userId'>;
interface createPostResponse {}

// --- HANDLERS ---
export const listPostsHandler: RequestHandler = async (request, response) => {
    response.send({ posts: await db.listPosts() });
};

export const createPostHandler: ExpressHandler<createPostRequest, createPostResponse> = async (
    req,
    res
) => {
    const { title, url, userId } = req.body;

    if (!title || !url || !userId) {
        return res.status(400).send({
            error: 'Missing required fields: title, url, and userId are all required.'
        });
    }

    const post: Post = {
        id: crypto.randomUUID(),
        postedAt: Date.now(),
        title: title,
        url: url,
        userId: userId,
    };

    await db.createPost(post);

    return res.sendStatus(201); 
};