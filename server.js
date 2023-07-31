const PORT = process.env.PORT ?? 8000;
const express = require('express');
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// get name
app.get('/name/:userEmail', async (req, res) => {
  const { userEmail } = req.params;

  try {
    const name = await pool.query('SELECT name FROM users WHERE email = $1', [userEmail]);
    res.json(Object.values(name.rows[0]).toString());
  } catch (err) {
    console.error(err);
  }
});

// get last name
app.get('/lastName/:userEmail', async (req, res) => {
  const { userEmail } = req.params;

  try {
    const name = await pool.query('SELECT last_name FROM users WHERE email = $1', [userEmail]);
    res.json(Object.values(name.rows[0]).toString());
  } catch (err) {
    console.error(err);
  }
});

// get user id
app.get('/id/:userEmail', async (req, res) => {
  const { userEmail } = req.params;

  try {
    const name = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    res.json(Object.values(name.rows[0]).toString());
  } catch (err) {
    console.error(err);
  }
});

// signup
app.post('/signup', async (req, res) => {
  const { email, password, name, lastName } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  try {
    const signUp = await pool.query(`INSERT INTO users (email, hashed_password, name, last_name) VALUES($1, $2, $3, $4)`, [email, hashedPassword, name, lastName]);
    const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' });
    res.json({ email,token });
  } catch (err) {
    console.error(err);
    if (err) {
      res.json({ detail: err.detail });
    }
  }
});

// login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (!users.rows.length) return res.json({ detail: 'User not found' });
    const success = await bcrypt.compare(password, users.rows[0].hashed_password);
    const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' });

    if (success) {
      res.json({ 'email' : users.rows[0].email, token });
    } else {
      res.json({ detail: 'Wrong password' });
    }
  } catch (err) {
    console.error(err);
  }
});

// Verify if movie is in favorites
app.get('/:userId/favorites/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  
  try {
    const movie = await pool.query('SELECT * FROM favorite_movies WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    if (movie.rows.length > 0) {
      res.status(200).json({ isInFavorites: true });
    } else {
      res.status(200).json({ isInFavorites: false });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify is movie is in watchlist
app.get('/:userId/watchlist/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  
  try {
    const movie = await pool.query('SELECT * FROM watchlist_movies WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    if (movie.rows.length > 0) {
      res.status(200).json({ isInWatchlist: true });
    } else {
      res.status(200).json({ isInWatchlist: false });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify is rating exist
app.get('/:userId/rate/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  
  try {
    const movie = await pool.query('SELECT * FROM valuation_movies WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    if (movie.rows.length > 0) {
      res.json(movie.rows);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add movie to favorites
app.post('/:userId/favorites/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  
  try {
    await pool.query('INSERT INTO favorite_movies (user_id, movie_id) VALUES ($1, $2)', [userId, movieId]);
    res.status(201).json({ message: 'Movie added to favorites' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add movie to watchlist
app.post('/:userId/watchlist/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  
  try {
    await pool.query('INSERT INTO watchlist_movies (user_id, movie_id) VALUES ($1, $2)', [userId, movieId]);
    res.status(201).json({ message: 'Movie added to watchlist' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
  
// Delete movie from favorites
app.delete('/:userId/favorites/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  
  try {
    await pool.query('DELETE FROM favorite_movies WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    res.status(200).json({ message: 'Movie removed from favorites' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete movie from watchlist
app.delete('/:userId/watchlist/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  
  try {
    await pool.query('DELETE FROM watchlist_movies WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    res.status(200).json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete movie from rate
app.delete('/:userId/rating/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  
  try {
    await pool.query('DELETE FROM valuation_movies WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    res.status(200).json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit rating
app.post('/:userId/rate/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  const { rating } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO valuation_movies (user_id, movie_id, valoration) VALUES ($1, $2, $3) ON CONFLICT (user_id, movie_id) DO UPDATE SET valoration = EXCLUDED.valoration',
      [userId, movieId, rating]
    );
    res.status(200).json({ message: 'Valoration updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit watched in watchlist
app.post('/:userId/watched/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  const { watched } = req.body;
  
  try {
    await pool.query(
      'UPDATE watchlist_movies SET watched = $1 WHERE user_id = $2 AND movie_id = $3',
      [watched, userId, movieId]
    );
    res.status(200).json({ message: 'Valoration updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Get favorites
app.get('/:userId/favorites', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const movies = await pool.query('SELECT * FROM favorite_movies WHERE user_id = $1', [userId]);
    res.json(movies.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Get watchlist
app.get('/:userId/watchlist', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const movies = await pool.query('SELECT * FROM watchlist_movies WHERE user_id = $1', [userId]);
    res.json(movies.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Get rating
app.get('/:userId/rating', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const movies = await pool.query('SELECT * FROM valuation_movies WHERE user_id = $1', [userId]);
    res.json(movies.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});