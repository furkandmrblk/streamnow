import {
  Resolver,
  Query,
  Mutation,
  FieldResolver,
  Ctx,
  Arg,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { ObjectId } from 'mongodb';
import { MyContext } from '../types/MyContext';
import { User, UserModel } from '../entity/User';
import { Stream, StreamModel } from '../entity/Stream';
import { ObjectIdScalar } from '../schema/object-id.scalar';
import { StreamInput } from '../types/StreamInput';
import { isAuth } from '../middleware/isAuth';

@Resolver(() => Stream)
export class StreamResolver {
  // This Query is responsible for fetching an individual Stream based on its StreamID
  @Query(() => Stream, { nullable: true })
  stream(@Arg('streamId', () => ObjectIdScalar) streamId: ObjectId) {
    // 1. find a single stream
    return StreamModel.findById(streamId);
  }

  @Query(() => [Stream]) // <- Array of Streams
  @UseMiddleware(isAuth) // This is necessary so that the User will get their own list of streams
  streams(@Ctx() ctx: MyContext) {
    // 2. display all streams for the current User
    return StreamModel.find({ author: ctx.res.locals.userId });
  }

  @Mutation(() => Stream)
  @UseMiddleware(isAuth)
  async addStream(
    @Arg('input') streamInput: StreamInput,
    @Ctx() ctx: MyContext
  ): Promise<Stream> {
    // 3. creating a new user's stream
    // why isn't typescript checking our type?
    const stream = new StreamModel({
      ...streamInput, // <- ... is a spread-operator. Everything a Stream requires is already passed in streamInput!
      author: ctx.res.locals.userId,
    } as Stream); // <- Cast the Model that we are creating as the type!
    await stream.save();
    return stream;
  }

  @Mutation(() => Stream)
  @UseMiddleware(isAuth)
  async editStream(
    @Arg('input') streamInput: StreamInput,
    @Ctx() ctx: MyContext
  ): Promise<Stream> {
    const { id, title, description, url } = streamInput;
    const stream = await StreamModel.findOneAndUpdate(
      { _id: id, author: ctx.res.locals.userId }, // find
      { title, description, url }, // update
      { runValidators: true, new: true } // runValidators so our updated things are valid (strings) in our graphql schema. new:true : so it's new and not a copy of the old stream
    );
    if (!stream) {
      throw new Error('Stream not found');
    }
    return stream;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteStream(
    @Arg('streamId', () => ObjectIdScalar) streamId: ObjectId,
    @Ctx() ctx: MyContext
  ): Promise<Boolean | undefined> {
    const deleted = await StreamModel.findByIdAndDelete({
      _id: streamId,
      author: ctx.res.locals.userId,
    });
    if (!deleted) {
      throw new Error('Stream not found');
    }
    return true;
  }

  // Fieldresolver so MongoDB can fetch the usertype that this reference is linking to each stream
  // It couples a author id to a userModel
  @FieldResolver()
  async author(@Root() stream: Stream): Promise<User | null> {
    return await UserModel.findById(stream.author);
  }
}
