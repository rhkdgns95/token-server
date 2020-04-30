import {
	Resolver,
	Query,
	Mutation,
	Arg,
	Ctx,
	UseMiddleware,
	Int,
} from 'type-graphql';
import { hash } from 'bcryptjs';
import { getConnection } from 'typeorm';
import { User } from './entity/User';
import { LoginResponse } from './api/user/LoginResponse';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';

@Resolver(User)
export class UserResolver {
	@Query(() => String)
	hi(): string {
		return 'HI';
	}
	@Query(() => String)
	@UseMiddleware(isAuth)
	async bye(@Ctx() { payload }: MyContext) {
		console.log('payload: ', payload);
		const userId = payload?.userId;
		return 'your user id is ' + userId;
	}

	@Query(() => [User])
	async users() {
		try {
			return await User.find();
		} catch (error) {
			return null;
		}
	}

	@Mutation(() => Boolean)
	async revokeTokensForUser(@Arg('userId', () => Int) userId: number) {
		await getConnection()
			.getRepository(User)
			.increment({ id: userId }, 'tokenVersion', 1);

			return true;
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

	@Mutation(() => LoginResponse)
	async login(
		@Arg('email') email: string,
		@Arg('password') password: string,
		@Ctx() { res }: MyContext
	): Promise<LoginResponse> {
		const user = await User.findOne({
			where: {
				email,
			},
		});
		if (user) {
			const valid: boolean = user.comparePassword(password);
			if (valid) {
				// login Successful
				const accessToken: string = createAccessToken(user);
				const refreshToken: string = createRefreshToken(user);
				sendRefreshToken(res, refreshToken);

				return {
					ok: true,
					error: undefined,
					token: accessToken,
				};
			} else {
				return {
					ok: false,
					error: 'Wrong password',
					token: undefined,
				};
			}
		} else {
			return {
				ok: false,
				error: 'Not found email',
				token: undefined,
			};
		}
	}
}
