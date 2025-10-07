import { RequestHandler } from 'express-serve-static-core';
import { db } from "../datastore";
import { Post } from "../types";
import crypto from 'crypto';

export type ExpressHandler<Req, Res> = RequestHandler<string,Partial<Res>,Partial<Req>,any>;


export const listPostsHandler: RequestHandler = (request, response) => {
	throw new Error("oops!");
	response.send({ posts: db.listPosts() });

}

type  createPostRequest = Pick<Post, 'title'|'url'|'userId'>;
interface createPostResponse {

}

export const createPostHandler: ExpressHandler<createPostRequest,createPostResponse> = (req, res) => {

	if (!req.body.title) {
		return res.status(400).send("Title field is required")
	}

	if (!req.body.title || !req.body.url || !req.body.userId) {
		return res.status(400)
	}
	const post: Post = {
		id: crypto.randomUUID(),
		postedAt: Date.now(),
		title: req.body.title,
		url: req.body.url,
		userId: req.body.userId

	}
	db.createPost(post)
	res.sendStatus(200);
}