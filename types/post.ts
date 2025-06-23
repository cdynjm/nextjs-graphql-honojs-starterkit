export interface Post {
    _id: string;
    encrypted_id?: string;
    status: string;
    author: {
        name: string;
        email: string;
        photo?: string;
        encrypted_id?: string;
        created_at?: string;
    }
    created_at?: Date;
    updated_at?: Date;
}