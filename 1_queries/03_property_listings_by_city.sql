-- Show all details about properties located in Vancouver including their average rating.


--     Select all columns from the properties table for properties located in Vancouver, and the average rating for each property.
--     Order the results from lowest cost_per_night to highest cost_per_night.
--     Limit the number of results to 10.
--     Only show listings that have a rating >= 4 stars.
--     To build this incrementally, you can start by getting all properties without the average rating first.

--  id  |       title        | cost_per_night |   average_rating
-- -----+--------------------+----------------+--------------------
--  224 | Nature bite        |          10526 | 4.1000000000000000
--  197 | Build they         |          34822 | 4.1000000000000000
--   47 | Aside age          |          35421 | 4.2500000000000000
--  149 | Present television |          53062 | 4.2222222222222222
-- (4 rows)


SELECT properties.*, AVG(property_reviews.rating) AS average_rating
FROM properties
JOIN property_reviews ON property_id = properties.id
-- WHERE properties.city = 'Vancouver'
WHERE city LIKE '%ancouv%'
GROUP BY properties.id
HAVING AVG(property_reviews.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;
