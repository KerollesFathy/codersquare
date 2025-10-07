import express, { RequestHandler , ErrorRequestHandler} from "express";
import { createPostHandler, listPostsHandler } from './handlers/postHandler';
const app = express();

app.use(express.json());


const requestLoggerMiddleware: RequestHandler =  (req, res, next) => {
	console.log("New Request", req.path, "-- body", req.body);
	next()
}

app.use(requestLoggerMiddleware);

app.get('/posts', listPostsHandler)

app.post('/posts', createPostHandler)

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	console.error("Uncaught exeption", err);
	return res.status(500).send({"error": "Oops, an unexpected error occurred, please try again"});
}

app.use(errorHandler)

app.listen(3000);