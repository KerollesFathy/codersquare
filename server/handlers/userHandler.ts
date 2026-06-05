import crypto from 'crypto';
import { db } from '../datastore';
import { User } from '../types';
import { ExpressHandler } from './postHandler';

type SignUpRequest = Pick<User, 'firstName' | 'lastName' | 'username' | 'email' | 'password'>;
interface SignUpResponse {
    id: string;
    error: string;
}

export const signUpHandler: ExpressHandler<SignUpRequest, SignUpResponse> = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).send({ error: 'All fields are required.' });
    }

    if (await db.getUserByEmail(email)) {
        return res.status(409).send({ error: 'Email already in use.' });
    }

    if (await db.getUserByUsername(username)) {
        return res.status(409).send({ error: 'Username already taken.' });
    }

    const user: User = {
        id: crypto.randomUUID(),
        firstName,
        lastName,
        username,
        email,
        password,
    };

    await db.createUser(user);

    return res.status(201).send({ id: user.id });
};
