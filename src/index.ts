import 'dotenv/config';
import 'reflect-metadata';
// import { createConnection } from 'typeorm';
// import { User } from './entity/User';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cookieParser from 'cookie-parser';
import { createConnection } from 'typeorm';
import { UserResolver } from './UserResolver';
import { verify } from 'jsonwebtoken';
import { User } from './entity/User';
import { createRefreshToken, createAccessToken } from './auth';
import { sendRefreshToken } from './sendRefreshToken';

(async () => {
	const app = express();
	app.use(cookieParser());

	app.get('/', (_req, res) => res.send('sayhello'));

	app.post('/refresh_token', async (req, res) => {
		const token: string | undefined = req.cookies.jid;
		console.log('req.headers: ', req.headers);
		console.log('token: ', token);
		if (!token) {
			return res.send({
				ok: false,
				accessToken: '',
			});
		}

		let payload: any;
		try {
			payload = verify(token, process.env.REFRESH_TOKEN_SECRET || '');
			console.log('payload: ', payload);
		} catch (error) {
			return res.send({
				ok: false,
				accessToken: '',
			});
		}
		if (payload?.userId) {
			const user: User | undefined = await User.findOne({
				where: {
					id: payload?.userId,
				},
			});
			if (!user) {
				return res.send({
					ok: false,
					accessToken: '',
				});
			} else {
				// ok
				if(user.tokenVersion !== payload.tokenVersion) {
					return res.send({
						ok: false,
						accessToken: '',
					});
				}
				console.log('is Ok');
				const refreshToken: string = createRefreshToken(user);
				const accessToken: string = createAccessToken(user);

				sendRefreshToken(res, refreshToken);

				return res.send({
					ok: true,
					accessToken,
				});
			}
		} else {
			return res.send({
				ok: false,
				accessToken: '',
			});
		}
		// console.log("res: ", res);
	});

	await createConnection();

	const apolloServer: ApolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserResolver],
		}),
		context: ({ req, res }) => ({ req, res }),
	});

	apolloServer.applyMiddleware({ app });

	app.listen(4000, () => {
		console.log('server is running to 4000');
	});
})();
