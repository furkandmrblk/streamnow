import { Model, Document } from 'mongoose';
import { getClassForDocument } from '@typegoose/typegoose';
import { MiddlewareFn } from 'type-graphql';

// Typegoose konvertiert unsere Objekte in MongoDB Datenbank zu JavaScript damit wir es lesen können

export const TypegooseMiddleware: MiddlewareFn = async (_, next) => {
  const result = await next();

  if (Array.isArray(result)) {
    return result.map((item) =>
      item instanceof Model ? convertDocument(item) : item
    );
  }

  if (result instanceof Model) {
    return convertDocument(result);
  }

  return result;
};

function convertDocument(doc: Document) {
  const convertedDocument = doc.toObject();
  const DocumentClass = getClassForDocument(doc)!;
  Object.setPrototypeOf(convertDocument, DocumentClass.prototype);
  return convertedDocument;
}
