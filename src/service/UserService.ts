import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserRepository } from "../repository/UserRepository";
import { User } from '../entity/User'
import  argon2, { argon2id } from "argon2";
import { isEmail } from "class-validator";
import { ApolloError } from "apollo-server";


@Service()
export class UserService {
    @InjectRepository()
    private readonly userRepository!: UserRepository

    async registerUser(email: string, password: string): Promise<User | undefined> {
        if (!isEmail(email)) throw new ApolloError("邮箱地址非法");
        if ((await this.userRepository.findByEmail(email)) !== undefined) throw new ApolloError("该邮箱已被注册");
        const passwordHash = await argon2.hash(password, {
            type: argon2id,
            memoryCost: 65536,
            hashLength: 64,
        });
        const user = await this.userRepository.save(await this.userRepository.create({
            useremail: email,
            passwordHash
        }));
        return user;
    }

    async matchPassword(user: User, password: string): Promise<boolean> {
        return await argon2.verify(user.passwordHash, password);
    }

    async updatePassword(user: User, password: string): Promise<User> {
        const passwordHash = await argon2.hash(password, {
            type: argon2id,
            memoryCost: 65536,
            hashLength: 64
        });
        user.passwordHash = passwordHash;
        return await this.userRepository.save(user);
    }
}
