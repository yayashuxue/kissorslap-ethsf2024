// utils/users.ts
interface User {
  id: string;
  username: string;
  room: string;
}

const users: User[] = [];

export function userJoin(user: User) {
  users.push(user);
  return user;
}

export function getCurrentUser(id: string) {
  return users.find((user) => user.id === id);
}

export function userLeave(id: string) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

export function getRoomUsers(room: string) {
  return users.filter((user) => user.room === room);
}
