import argon2 from "argon2";
import {
    Resolver,
    Query,
    Mutation,
    Arg,
    InputType,
    Field,
    Ctx,
    ObjectType,
} from "type-graphql";

import { User } from "../entities/User";
import { MyContext } from "src/types";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    me(@Ctx() { em, req }: MyContext) {
        //you are not logged in
        if (!req.session.userId) {
            return null;
        }

        const user = em.findOne(User, { id: req.session.userId });
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePasswordInput)
        options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length < 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be great than 2",
                    },
                ],
            };
        }

        if (options.password.length < 2) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "must be 2 characters or more",
                    },
                ],
            };
        }
        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            username: options.username,
            password: hashedPassword,
        });
        try {
            await em.persistAndFlush(user);
        } catch (err) {
            //duplicate username error
            if (err.code === "23505" || err.detail.includes("already exists")) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already exists",
                        },
                    ],
                };
            }
            console.error("message: ", err.message);
        }

        //log in user after registration
        //store user id session
        //keep user logged in
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options", () => UsernamePasswordInput)
        options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "user does not exist",
                    },
                ],
            };
        }

        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "password does not match",
                    },
                ],
            };
        }

        req.session.userId = user.id;

        return {
            user,
        };
    }
}
