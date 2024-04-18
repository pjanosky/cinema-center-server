import { ObjectId } from "mongoose";
import model from "./model";
import { User, UserDocument, NewUser } from "./types";

function parseUser(user: UserDocument): User {
  if (user.role === "editor") {
    return {
      _id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio!,
    };
  } else {
    return {
      _id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      following: user.following!.map((id) => id.toString()),
    };
  }
}

export async function createUser(user: NewUser): Promise<User | undefined> {
  try {
    const newUser = await model.create(user);
    return parseUser(newUser);
  } catch {
    return undefined;
  }
}

export async function findUserById(userId: string): Promise<User | undefined> {
  try {
    const document = await model.findById(userId);
    return document ? parseUser(document) : undefined;
  } catch {
    return undefined;
  }
}

export async function findUserByUsername(
  username: string
): Promise<User | undefined> {
  try {
    const document = await model.findOne({
      username: { $regex: `^${username}$`, $options: "i" },
    });
    return document ? parseUser(document) : undefined;
  } catch {
    return undefined;
  }
}

export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  try {
    const document = await model.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });
    return document ? parseUser(document) : undefined;
  } catch {
    return undefined;
  }
}

export async function findUsersByUserIds(userIds: string[]): Promise<User[]> {
  try {
    const documents = await model.find({
      _id: { $in: userIds },
    });
    return documents.map(parseUser);
  } catch {
    return [];
  }
}
export async function findUsersByQuery({
  query,
  userIds,
}: {
  query: string | undefined;
  userIds: string[] | undefined;
}): Promise<User[]> {
  const queryFilter = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
    ],
  };
  const userIdFilter = {
    _id: {
      $in: userIds,
    },
  };
  try {
    const documents = await model.find({
      $and: [
        {},
        ...(query ? [queryFilter] : []),
        ...(userIds ? [userIdFilter] : []),
      ],
    });
    return documents.map(parseUser);
  } catch {
    return [];
  }
}

export async function findUsersFollowing(userId: string): Promise<User[]> {
  try {
    const documents = await model.find({ following: userId });
    return documents.map(parseUser);
  } catch {
    return [];
  }
}

export async function findUserWithUsernamePassword(
  username: string,
  password: string
): Promise<User | undefined> {
  try {
    const document = await model.findOne({ username, password });
    return document ? parseUser(document) : undefined;
  } catch {
    return undefined;
  }
}

export async function findUserWithIdPassword(
  userId: string,
  password: string
): Promise<User | undefined> {
  try {
    const document = await model.findOne({ _id: userId, password });
    return document ? parseUser(document) : undefined;
  } catch {
    return undefined;
  }
}

export async function updateUser(user: User): Promise<boolean> {
  try {
    const result = await model.updateOne({ _id: user._id }, { $set: user });
    return result.matchedCount === 1;
  } catch {
    return false;
  }
}

export async function updateUserPassword(
  userId: string,
  password: string
): Promise<boolean> {
  try {
    const result = await model.updateOne(
      { _id: userId },
      { $set: { password } }
    );
    return result.matchedCount === 1;
  } catch {
    return false;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const result = await model.deleteOne({ _id: userId });
    return result.deletedCount === 1;
  } catch {
    return false;
  }
}
