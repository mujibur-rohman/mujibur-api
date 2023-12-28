export class User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  password: string;
  avatar?: Avatars | null;
  role: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Avatars {
  id: string;
  url: string;
  userId: string;
}

export class ErrorType {
  message: string;
  code?: string;
}
