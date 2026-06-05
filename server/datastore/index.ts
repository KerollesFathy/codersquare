import { CommentDao } from './dao/CommentDao';
import { LikeDao } from './dao/LikeDao';
import { PostDao } from './dao/PostDao';
import { UserDao } from './dao/UserDao';
import { SqlDatastore } from './sql';

export interface Datastore extends UserDao, PostDao, LikeDao, CommentDao {}

export const db = new SqlDatastore();
export const initDb = (dbPath: string) => db.open(dbPath);
