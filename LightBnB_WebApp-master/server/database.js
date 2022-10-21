const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
  .query(`
    SELECT * 
    FROM users
    WHERE LOWER(email) = $1;`,
    [email.toLowerCase()])
  .then((user) => {
    return user.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
  .query(`
    SELECT * 
    FROM users
    WHERE id = $1;`,
    [id])
  .then((user) => {
    return user.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return insertObjToDB('users', user);
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
  .query(`
    SELECT res.*, prop.*,
      AVG(rev.rating) AS average_rating
    FROM reservations res
    JOIN properties prop
      ON prop.id = res.property_id
    LEFT JOIN property_reviews rev
      ON prop.id = rev.property_id
    WHERE res.guest_id = $1
    GROUP BY res.id, prop.id
    ORDER BY res.start_date
    LIMIT $2;`,
    [guest_id, limit])
  .then((result) => {
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  const queryParams = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  LEFT JOIN property_reviews 
    ON properties.id = property_id
  WHERE TRUE
  `; //WHERE TRUE is added so that there is a WHERE clause to add all of the conditions to

  if (options.city) {
    queryParams.push(`%${options.city.toLowerCase()}%`);
    queryString += `AND LOWER(city) LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `AND owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryString += `AND cost_per_night/100 >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    queryString += `AND cost_per_night/100 <= $${queryParams.length} `;
  }

  queryString += `
  GROUP BY properties.id
  `

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night 
  LIMIT $${queryParams.length};
  `;

  return pool.query(queryString, queryParams).then((res) => res.rows);
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;

/**
 * Add entity to a database table
 * @param {string} tableName The name of the table to insert into
 * @param {{...}} entity The entity to be inserted, in object form. Key names will be used as names of columns to insert to.
 * @return {Promise<{}>} A promise to the entity.
 */

const insertObjToDB = function (tableName, entity) {
  let columns = '';
  let values = '';
  const params = [];

  Object.keys(entity).forEach(key => {
    params.push(entity[key]);
    columns += `${key}, `;
    values += `$${params.length}, `
  })

  const query = `
  INSERT INTO ${tableName} (${columns.slice(0,-2)})
  VALUES (${values.slice(0, -2)})
  RETURNING *;
  `;

  return pool
  .query(query, params)
  .then((user) => {
    return user.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
};
