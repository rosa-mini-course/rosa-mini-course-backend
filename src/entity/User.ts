import { IsNotEmpty, Length, IsEmail } from "class-validator";
import { Field, ID, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { STUDENT } from "../const";
import { Course } from "./Course";

@ObjectType()
@Entity()
@Unique(["useremail"])
export class User {
    @Field(() => ID)
    @PrimaryGeneratedColumn("increment")
    userId!: number;

    @Field()
    @Column()
    @IsEmail()
    useremail!: string;

    @Column()
    @Length(4, 100)
    passwordHash!: string;

    @Field()
    @Column({ default: STUDENT })
    @IsNotEmpty()
    role!: string;

    @Field(() => Date)
    @CreateDateColumn()
    createAt!: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updateAt!: Date;
}