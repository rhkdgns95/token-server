# Token Server
- TypeGraphQL


## Ref

## Todo
- [x] app init.
- [x] prettier, eslint
- [x] TypeORM, TypeGraphQL(resolver, Context)

## Install
- yarn add typeorm
- yarn add -D eslint prettier typescript
- yarn add -D eslint-config-airbnb-base eslint-plugin-import
- yarn add -D eslint-config-prettier eslint-plugin-prettier 
- yarn 
- yarn upgrade-interactive --latest
- yarn add express apollo-server-express graphql
- yarn add -D @types/express @types/graphql
- yarn add type-graphql bcryptjs
- yarn add -D nodemon
- yarn add jsonwebtoken

## Code
<details>
<summary>1. Query의 response타입 설정.</summary>
<div>

> /api/user/LoginResponse.ts
```ts
@ObjectType()
class LoginResponse {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => String, { nullable: true })
  token?: string;
}
```
</div>
</details>

<details>
<summary>2. Context를 통한 Requset처리</summary>
<div>

> 0) MyContext.ts
```ts
// 요청 쿼리의 header에서 키 'x-jwt'의 데이터를 처리.
import { Request, Response } from 'express';

export interface MyContext {
  req: Request;
  res: Response;
};
```
> 1) index.ts
```ts
(async () => {
  // ...
  const app = express();

  const apolloServer = new ApolloServer({
    schema: buildSchema({
      resolvers: [GetMyProfile],
      context: ({req, res}) => ({req, res})
    })
  });

  apolloServer.middlewares({ app });
})();
```
> 2) EmailSignIn.ts
```ts
@Mutation(() => User)
async EmailSignIn(
  @Arg('email') email: string,
  @Arg('password') password: string,
  @Ctx() ctx: MyContext
): Promise<Boolean> {
  const { req } = ctx;
  const token: string | undefined = req.get('x-jwt');
  return Boolean(token);
}
```

</div>
</details>


## Study
1. typeorm 서버생성.
- typeorm init --name "생성될 디렉터리 명" --database "디비 명(postgres)"

2. typescript의 node환경 구성에 필요한것 tsconfig.json환경을 제공.
- npx tsconfig.json

3. yarn upgrade-interactive --latest
- yarn 입력후 사용해야 됨.
- 최신버전으로 다운 됨.

## ETC