import { Datastore } from '../';
import { User, Post, Like, Comment } from '../../types';

export class InMemoryDatastore implements Datastore {
    private users: User[] = [];
    private posts: Post[] = [];
    private comments: Comment[] = [];
    private likes: Like[] = [];

    async createUser(user: User): Promise<void> {
        this.users.push(user);
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        return this.users.find((u) => u.email === email);
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        return this.users.find((u) => u.username === username);
    }

    async listPosts(): Promise<Post[]> {
        return this.posts;
    }

    async createPost(post: Post): Promise<void> {
        this.posts.push(post);
    }

    async getPost(id: string): Promise<Post | undefined> {
        return this.posts.find((p) => p.id === id);
    }

    async deletePost(id: string): Promise<void> {
        const index = this.posts.findIndex((p) => p.id === id);
        if (index !== -1) {
            this.posts.splice(index, 1);
        }
    }

    async createLike(like: Like): Promise<void> {
        this.likes.push(like);
    }

    async createComment(comment: Comment): Promise<void> {
        this.comments.push(comment);
    }

    async listComments(postId: string): Promise<Comment[]> {
        return this.comments.filter((c) => c.postId === postId);
    }

    async deleteComment(id: string): Promise<void> {
        const idx = this.comments.findIndex((c) => c.id === id);
        if (idx !== -1) this.comments.splice(idx, 1);
    }
}
