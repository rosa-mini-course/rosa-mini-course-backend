import { IsNotEmpty } from "class-validator";
import { Field, ID, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Video } from "./Video";

@ObjectType()
@Entity()
@Unique(["coursename"])
export class Course {
    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid")
    courseId!: string;

    @Field()
    @Column()
    @IsNotEmpty()
    coursename!: string;

    @Field()
    @Column({ default: "" }) 
    info!: string;

    @Field(() => User)
    @ManyToOne(() => User, user => user.teachingCourse)
    lecturer!: User;

    @Field(() => [User])
    @ManyToMany(() => User, user => user.subscribedCourses)
    subscribers?: User[];

    @Field(() => [Video])
    @OneToMany(() => Video, video => video.course)
    videos?: Video[];

    @Field(() => Date)
    @CreateDateColumn()
    createdAt!: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updatedAt!: Date;
}