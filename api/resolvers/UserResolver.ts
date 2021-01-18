import { Resolver, Query, UseMiddleware, Arg, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { MyContext } from '../types/MyContext';
import { isAuth } from '../middleware/isAuth';
import { User, UserModel } from '../entity/User';
import { ObjectIdScalar } from '../schema/object-id.scalar';

@Resolver(() => User)
export class UserResolver {
  // First Query will fetch a specific User by passing in a UserID
  @Query(() => User, { nullable: true }) // nullable -> If User isn't found we will get a null back
  async user(@Arg('userId', () => ObjectIdScalar) userId: ObjectId) {
    // The UserID will only accept an ObjectIDScalar; As long as we pass in the UserID we should find the User
    return await UserModel.findById(userId);
  }
  // Second Query will pass the current User who is logged in
  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth) // Utilizing isAuth as middleware Decorator
  async currentUser(@Ctx() ctx: MyContext): Promise<User | null> {
    return await UserModel.findById(ctx.res.locals.userId);
  }
}
