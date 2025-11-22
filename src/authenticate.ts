import bcrypt from 'bcryptjs'  //using to hash passwords before storing them
import {supabase} from './config_database/supabaseClient';

//registering new user
export async function registerUser(username: string, password: string) {
    //converting password to a secure hash
    //10 is the amount of times .hash should mix the password (10 is the recommended default)
    const hashedPassword = await bcrypt.hash(password, 10);

    //inserting a new row into our supabase users table
    const {data, error} = await supabase.from('users').insert([{username, password_hash: hashedPassword}]);

    if(error) {
        throw error;
    }
    return data;
}

//logging in user
export async function login(username: string, password: string) {
    //looks in "users" table in supabase, * selects all columns and then eq filters to find
    //the entry where the usernames match, .single ensures there is only one user with that username
    const {data, error} = await supabase.from('users').select('*').eq('username', username).single();

    if(error) {
        throw error;
    }

    if(data == null) {
        throw new Error('User not found');
    }

    //comparing password with stored hash
    const match = await bcrypt.compare(password, data.password_hash);
    if(match == null) {
        throw new Error('Incorrect password!');
    }

    return data;
}
