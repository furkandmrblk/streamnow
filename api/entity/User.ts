import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import { Field, ObjectType } from 'type-graphql';

// GraphQL Schema gets knowledge about this User-Class because of the @ObjectType
@ObjectType({ description: 'User' })
export class User {
  // Mit Field können wir bei GraphQL Interface auf diese Objekte zugreifen
  @Field()
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true })
  email: string;

  @Property({ required: true })
  password: string;
}

export const UserModel = getModelForClass(User);
