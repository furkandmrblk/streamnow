import { InputType, Field } from 'type-graphql';

import { ObjectId } from 'mongodb';
import { Stream } from '../entity/Stream';

@InputType()
export class StreamInput implements Partial<Stream> {
  // Partial means that not every Field is necessary. We only need a title to create a stream
  @Field({ nullable: true })
  id?: ObjectId;

  @Field() // required Field
  title: string;

  @Field({ nullable: true }) // not necessarily required
  description?: string;

  @Field() // required Field
  url: string;
}
