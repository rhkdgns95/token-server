import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	BaseEntity,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { compareSync } from 'bcryptjs';

/* eslint-disable */
@ObjectType()
@Entity('users')
export class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field()
	@Column('text', { unique: true })
	email: string;

	@Field()
	@Column('text')
	password: string;

	comparePassword(password: string): boolean {
		if (!this.password) {
			return false;
		}
		const valid: boolean = compareSync(password, this.password);
		return valid;
	}
	@Field()
	@Column("int", { default: 0 })
	tokenVersion: number;
	@Field()
	@CreateDateColumn()
	createdAt: string;

	@Field()
	@UpdateDateColumn()
	updatedAt: string;
}
