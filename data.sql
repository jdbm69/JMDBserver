CREATE DATABASE jmdb;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL
);

CREATE TABLE favorite_movies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  movie_id VARCHAR(255) NOT NULL
);

CREATE TABLE watchlist_movies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  movie_id VARCHAR(255) NOT NULL,
  watched BOOLEAN DEFAULT FALSE
);

CREATE TABLE valuation_movies (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  valoration INT NOT NULL,
  CONSTRAINT unique_user_movie_rating UNIQUE (user_id, movie_id)
);