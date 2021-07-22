const { Pool, Client } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

pool.connect().then(() => {
  console.log("Connected");
}).catch(e => {
  console.log(e.message);
});

/// ----------------------------------------------------- Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

// NEW - uses database
const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1;`, [email])
    .then(res => res.rows[0] ? res.rows[0] : null)
    .catch(err => console.error('query error', err.stack));
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

// NEW - uses database
const getUserWithId = function(id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1;`, [id])
    .then(res => res.rows[0] ? res.rows[0] : null)
    .catch(err => console.error('query error', err.stack));
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

// NEW - uses database
const addUser = function(user) {
  const values = [user.name, user.email, user.password];
  return pool
    .query(`
    INSERT INTO users (name, email, password)
    VALUES($1, $2, $3)
    RETURNING *;
    `, values)
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
};
exports.addUser = addUser;


/// ----------------------------------------------------- Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */

// NEW - uses database
const getAllReservations = function(guest_id, limit = 10) {
  const values = [guest_id, limit];
  return pool
    .query(`
      SELECT reservations.*, properties.*, AVG(property_reviews.rating) AS average_rating
      FROM reservations
      JOIN properties ON property_id = properties.id
      JOIN property_reviews ON reservation_id = reservations.id
      WHERE reservations.guest_id = $1 AND reservations.end_date < now()::date
      GROUP BY reservations.id, properties.id
      ORDER BY reservations.start_date
      LIMIT $2;
      `, values)
    .then(res => res.rows ? res.rows : null)
    .catch(err => console.error('query error', err.stack));
};
exports.getAllReservations = getAllReservations;


/// ----------------------------------------------------- Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

// NEW - uses database
const getAllProperties = function(options, limit = 10) {
  const values = [limit];

  // Create base query string
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id `;

  // Build query string based on conditions created by form submission (options)
  if (options.city) {
    values.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${values.length} `;
  }
  if (options.owner_id) {
    values.push(`${options.owner_id}`);
    queryString += `AND owner_id LIKE $${values.length} `;
  }
  if (options.minimum_price_per_night) {
    values.push(`${options.minimum_price_per_night * 100}`);
    queryString += `AND cost_per_night >= $${values.length} `;
  }
  if (options.maximum_price_per_night) {
    values.push(`${options.maximum_price_per_night * 100}`);
    queryString += `AND cost_per_night <= $${values.length} `;
  }
  if (options.minimum_rating) {
    values.push(`${options.minimum_rating}`);
    queryString += `AND property_reviews.rating >= $${values.length} `;
  }

  // Add the remainder of the query string
  queryString += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $1;`;

  return pool
    .query(queryString, values)
    .then(res => res.rows ? res.rows : null)
    .catch(err => console.error('query error', err.stack));
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */


// NEW - uses database
const addProperty = function(property) {
  const values = [];

  let queryString = `INSERT INTO properties(`;

  // These keys = values that need to be stored in database as integers
  const typeConvert = ['owner_id', 'parking_spaces', 'number_of_bathrooms', 'number_of_bedrooms'];

  // Iterate over property object, add key to INSERT clause of query, add value to values array
  for (const attribute in property) {
    if (property[attribute]) {
      typeConvert.includes(property[attribute]) ? values.push(Number(property[attribute])) : values.push(property[attribute]);
      queryString += `${attribute}, `;
    }
  }

  // Add necessary query text between clauses
  queryString += `active) VALUES(`;

  // Add parameterized values to reference items in values array
  for (let i = 0; i < values.length; i++) {
    queryString += `$${i + 1}, `;
  }

  // Add remaining query
  queryString += `true) RETURNING *;`;

  return pool
    .query(queryString, values)
    .then(res => res.rows ? res.rows : null)
    .catch(err => console.error('query error', err.stack));
};
exports.addProperty = addProperty;
