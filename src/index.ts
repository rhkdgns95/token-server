import 'reflect-metadata';
// import { createConnection } from 'typeorm';
// import { User } from './entity/User';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { UserResolver } from './UserResolver';

(async () => {
	const app = express();
	app.get('/', (_req, res) => res.send('sayhello'));
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
