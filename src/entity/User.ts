import { IsNotEmpty, Length, IsEmail } from "class-validator";
import { Field, ID, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { STUDENT } from "../const";
import { Course } from "./Course";
import { Video } from "./Video";

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
    @IsNotEmpty()
    useremail!: string;

    @Column()
    @Length(4, 100)
    passwordHash!: string;

    @Field()
    @Column({ default: STUDENT })
    @IsNotEmpty()
    role!: string;

    @Field(() => [Course])
    @OneToMany(() => Course, course => course.lecturer)
    teachingCourses?: Course[];

    @Field(() => [Video])
    @OneToMany(() => Video, video => video.uploader)
    uploadedVideos?: Video[];

    @Field(() => [Course])
    @ManyToMany(() => Course, course => course.subscribers, {
        cascade: true
    })
    @JoinTable()
    subscribedCourses?: Course[];

    @Field(() => Date)
    @CreateDateColumn()
    createAt!: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updateAt!: Date;
}