import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { Datastore } from '../';
import { User, Post, Like, Comment } from '../../types';

export class SqlDatastore implements Datastore {
    private db!: sqlite3.Database;

    async open(dbPath: string): Promise<void> {
        this.db = await new Promise<sqlite3.Database>((resolve, reject) => {
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) reject(err);
                else resolve(db);
            });
        });
        await this.run('PRAGMA foreign_keys = ON');
        await this.runMigrations();
    }

    private async runMigrations(): Promise<void> {
        await this.run(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                applied_at INTEGER NOT NULL
            )
        `);

        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs
            .readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            const row = await this.get<{ name: string }>(
                'SELECT name FROM migrations WHERE name = ?',
                [file],
            );
            if (!row) {
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
                await this.exec(sql);
                await this.run('INSERT INTO migrations (name, applied_at) VALUES (?, ?)', [
                    file,
                    Date.now(),
                ]);
            }
        }
    }

    private run(sql: string, params: unknown[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    private exec(sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    private get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row as T | undefined);
            });
        });
    }

    private all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows as T[]);
            });
        });
    }

    async createUser(user: User): Promise<void> {
        await this.run(
            'INSERT INTO users (id, firstName, lastName, username, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, user.firstName, user.lastName, user.username, user.email, user.password],
        );
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        return this.get<User>('SELECT * FROM users WHERE email = ?', [email]);
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        return this.get<User>('SELECT * FROM users WHERE username = ?', [username]);
    }

    async listPosts(): Promise<Post[]> {
        return this.all<Post>('SELECT * FROM posts ORDER BY postedAt DESC');
    }

    async createPost(post: Post): Promise<void> {
        await this.run(
            'INSERT INTO posts (id, title, url, userId, postedAt) VALUES (?, ?, ?, ?, ?)',
            [post.id, post.title, post.url, post.userId, post.postedAt],
        );
    }

    async getPost(id: string): Promise<Post | undefined> {
        return this.get<Post>('SELECT * FROM posts WHERE id = ?', [id]);
    }

    async deletePost(id: string): Promise<void> {
        await this.run('DELETE FROM posts WHERE id = ?', [id]);
    }

    async createLike(like: Like): Promise<void> {
        await this.run('INSERT INTO likes (userId, postId) VALUES (?, ?)', [
            like.userId,
            like.postId,
        ]);
    }

    async createComment(comment: Comment): Promise<void> {
        await this.run(
            'INSERT INTO comments (id, userId, postId, comment, postedAt) VALUES (?, ?, ?, ?, ?)',
            [comment.id, comment.userId, comment.postId, comment.comment, comment.postedAt],
        );
    }

    async listComments(postId: string): Promise<Comment[]> {
        return this.all<Comment>(
            'SELECT * FROM comments WHERE postId = ? ORDER BY postedAt ASC',
            [postId],
        );
    }

    async deleteComment(id: string): Promise<void> {
        await this.run('DELETE FROM comments WHERE id = ?', [id]);
    }
}
