import { buildSchema } from "graphql";
import { gql } from "graphql-request";

export const adminSchema = buildSchema(gql`
  #types
  type User {
    encrypted_id: String
    name: String
    email: String
    password: String
    role: Role
    photo: String
    created_at: String
    updated_at: String
    posts: [Post]
  }
  type Post {
    encrypted_id: String
    status: String
    author: User
    created_at: String
    updated_at: String
  }

  type Role {
    name: String
  }

  type PaginatedUsers {
    users: [User]
    totalCount: Int
  }

  #queries
  type Query {
    getUsers(limit: Int, offset: Int): PaginatedUsers
    getUserInfo(encrypted_id: String): User
    getUserPosts(encrypted_id: String): [Post]
    getPosts: [Post]
  }

`);
