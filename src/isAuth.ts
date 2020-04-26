import { MiddlewareFn } from 'type-graphql';
import { verify } from 'jsonwebtoken';
import { MyContext } from './MyContext';

// bearer token

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
	const authorization: string | undefined = context.req.get('JID');
	if (!authorization) {
		throw new Error('Not authenticated');
	}
	try {
		const token = authorization.split(' ')[1];
		const payload = verify(token, process.env.ACCESS_TOKEN_SECRET || '');
		context.payload = payload as any;
	} catch (error) {
		throw new Error(error);
	}
	return next();
};
