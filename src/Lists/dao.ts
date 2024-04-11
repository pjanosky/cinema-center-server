import model from "./model";
import { List, ListDocument, NewList } from "./types";

function parseList(document: ListDocument): List {
  return {
    ...document,
    _id: document._id.toString(),
    date: document.date.toISOString(),
    userId: document.userId.toString(),
  };
}

export async function getListById(listId: string): Promise<List | undefined> {
  try {
    const document = await model.findById(listId);
    return document ? parseList(document) : undefined;
  } catch {
    return undefined;
  }
}

export async function createList(list: NewList): Promise<List | undefined> {
  try {
    const document = await model.create(list);
    return parseList(document);
  } catch {
    return undefined;
  }
}

export async function updateList(list: List): Promise<boolean> {
  try {
    const result = await model.updateOne({ _id: list._id }, { $set: list });
    return result.modifiedCount === 1;
  } catch {
    return false;
  }
}

export async function deleteList(listId: string): Promise<boolean> {
  try {
    const result = await model.deleteOne({ _id: listId });
    return result.deletedCount === 1;
  } catch {
    return false;
  }
}

export async function findListsByQuery({
  userId,
  movieId,
}: {
  userId: string | undefined;
  movieId: string | undefined;
}): Promise<List[]> {
  try {
    const documents = await model.find({
      $and: [
        ...(userId ? [{ userId }] : []),
        ...(movieId ? [{ "entries.movieId": movieId }] : []),
      ],
    });
    return documents.map(parseList);
  } catch {
    return [];
  }
}
