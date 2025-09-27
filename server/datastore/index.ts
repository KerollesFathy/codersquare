import { CommentDoa } from './CommentDao';
import { LikeDao } from './LikeDoa';
import { PostDao } from './PostDoa';
import { UserDao } from './UserDao';



export interface Datastore extends UserDao, PostDao, LikeDoa, CommentDoa {

}