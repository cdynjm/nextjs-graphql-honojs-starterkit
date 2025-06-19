import { buildSchema } from "graphql";
import { gql } from "graphql-request";

export const adminSchema = buildSchema(gql`
  #types
  type User {
    id: Int
    encrypted_id: String
    name: String
    email: String
    password: String
    role: Int
    photo: String
    created_at: String
    updated_at: String
  }

  type PaginatedUsers {
    users: [User]
    totalCount: Int
  }

  #queries
  type Query {
    getUsers(limit: Int, offset: Int): PaginatedUsers
    getUserInfo(encrypted_id: String): User
  }

`);
