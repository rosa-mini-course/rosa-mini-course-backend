import { IsDataURI } from "class-validator";
import { Field, ID, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Course } from "./Course";

@ObjectType()
@Entity()
@Unique(["title"])
export class Video {
    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid")
    videoId!: string;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column({ default: ""})
    info?: string;

    @Field(() => Course)
    @ManyToOne(() => Course, course => course.videos)
    course!: Course;

    @Field()
    @Column()
    @IsDataURI()
    location!: string;  // 在本地的位置或者远程的链接

    @Field(() => Date)
    @CreateDateColumn()
    createdAt!: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updatedAt!: Date;
}