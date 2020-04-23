import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class LoginResponse {
	@Field(() => Boolean)
	ok: boolean;

	@Field({ nullable: true })
	error?: string;

	@Field(() => String, { nullable: true })
	token?: string;
}
