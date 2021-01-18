import { InputType, Field } from 'type-graphql';

@InputType()
export class AuthInput {
  @Field() // Fields are required by default
  email: string;

  @Field()
  password: string;
}
