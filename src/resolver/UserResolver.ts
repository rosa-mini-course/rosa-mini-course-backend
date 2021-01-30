import { Authorized ,Mutation ,Arg, ConflictingDefaultWithNullableError, Ctx, FieldResolver, Query, Resolver, ResolverInterface, Root, Args } from "type-graphql";
import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { AppContext, AppUserContext } from "../context";
import { User } from "../entity";
import { ApolloError } from "apollo-server";

import { UserRepository } from "../repository/UserRepository";
import { UserService } from "../service/UserService";
import { isEmail } from "class-validator";


@Service()
@Resolver(() => User)
export class UserResolver implements ResolverInterface<User> {
    @InjectRepository()
    private readonly userRepository!: UserRepository;

    @Inject()
    private readonly userService!: UserService;

    @Query(() => Number)
    async userId(@Root() user: User): Promise<number> {
        return user.userId
    }

    @Query(() => User, { nullable: true})
    async me(@Ctx() ctx: AppUserContext): Promise<User | undefined> {
        return ctx.getSessionUser();
    }

    @Query(() => Boolean)
    async existEmail(
        @Arg("email") email: string
    ): Promise<boolean> {
        if (!isEmail(email)) {
            throw new ApolloError("非法邮箱地址");
        }
        return (await this.userRepository.findByEmail(email)) !== undefined;
    }

    @Mutation(() => User)
    async signUp(
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<User | undefined> {
        return this.userService.registerUser(email, password);
    }
  
    @Mutation(() => User, { nullable: true })
    async signIn(@Arg("useremail") useremail: string, @Arg("password") password: string, @Ctx() ctx: AppContext): Promise<User | null> {
        const user = await this.userRepository.findOneOrFail({ useremail });
    
        if (!(await this.userService.matchPassword(user, password))) {
            throw new ApolloError("邮箱或密码错误。", "WRONG_EMAIL_ADDRESS_OR_PASSWORD");
        }
    
        if (ctx.session) {
            ctx.session.userId = user.userId;
        }
        return user;
    }
  
    @Mutation(() => Boolean)
    async signOut(@Ctx() ctx: AppContext): Promise<boolean> {
        ctx.session = null;
        return true;
    }
  
    @Authorized()
    @Mutation(() => Boolean)
    async updatePassword(
        @Ctx() ctx: AppUserContext,
        @Arg("newPassword") newPassword: string,
        @Arg("oldPassword") oldPassword: string
    ): Promise<boolean> {
        const user = ctx.getSessionUser() as User;
        if (!(await this.userService.matchPassword(user, oldPassword))) {
            throw new ApolloError("旧密码错误。");
        }
    
        await this.userService.updatePassword(user, newPassword);
        return true;
    }
}
