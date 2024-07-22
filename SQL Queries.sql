-- create a database a called 'routine_list' and enter the below queries in postgreSQL.
CREATE TABLE
    users (
        id SERIAL PRIMARY KEY NOT NULL,
        user_name VARCHAR(30) NOT NULL UNIQUE,
        first_name VARCHAR(20) NOT NULL,
        last_name VARCHAR(20),
        password TEXT,
        email VARCHAR(50) UNIQUE NOT NULL
    );

CREATE TABLE
    todo_list (
        id SERIAL PRIMARY KEY NOT NULL,
        user_id INTEGER REFERENCES users (id),
        todo_title TEXT,
        time TIME
    );