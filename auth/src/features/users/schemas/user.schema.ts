import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface UserAttrs {
  name: string;
  email: string;
  password: string;
}

@Schema({
  collection: 'users',
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  password!: string;
}

export type UserDocument = Document & User;

export const UserSchema = SchemaFactory.createForClass(User);
