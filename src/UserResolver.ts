import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './entity/User';
import { LoginResponse } from './api/user/LoginResponse';
import { MyContext } from './MyContext';

@Resolver(User)
export class UserResolver {
	@Query(() => String)
	hi(): string {
		return 'HI';
	}

	@Query(() => [User])
	async users() {
		try {
			return await User.find();
		} catch (error) {
			return null;
		}
	}

	@Mutation(() => LoginResponse)
	async login(
		@Arg('email') email: string,
		@Arg('password') password: string,
		@Ctx() ctx: MyContext
	): Promise<LoginResponse> {
		console.log(ctx.req.get('x-jwt'));
		try {
			const user: User | undefined = await User.findOne({
				where: {
					email,
				},
			});
			if (user) {
				const valid = user.comparePassword(password);
				if (valid) {
					const token: string = jwt.sign({ userId: user.id }, 'SECRET_KEY', {
						expiresIn: '15m',
					});
					return {
						ok: true,
						error: undefined,
						token,
					};
				} else {
					return {
						ok: false,
						error: 'Not Found Password',
						token: undefined,
					};
				}
			} else {
				return {
					ok: false,
					error: 'Not Found User',
					token: undefined,
				};
			}
		} catch (error) {
			console.log('login error: ', error.message);
			return {
				ok: false,
				error: error.message,
				token: undefined,
			};
		}
	}

	@Mutation(() => Boolean)
	async register(
		@Arg('email') email: string,
		@Arg('password') password: string
	) {
		const hashed: string = await hash(password, 12);
		try {
			await User.insert({
				email,
				password: hashed,
			});
			return true;
		} catch (error) {
			console.log('register error: ', error.message);
			return false;
		}
	}
}
