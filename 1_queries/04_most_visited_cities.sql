-- Get a list of the most visited cities.

--     Select the name of the city and the number of reservations for that city.
--     Order the results from highest number of reservations to lowest number of reservations.

--        city        | total_reservations
-- -------------------+--------------------
--  Carcross          |                405
--  Town of Hay River |                379
--  Whitehorse        |                376
--  Town of Inuvik    |                298
--  Yellowknife       |                257
--  (251 rows)


SELECT city, COUNT(reservations.*) AS total_reservations
FROM properties
JOIN reservations ON property_id = properties.id
GROUP BY city
ORDER BY total_reservations DESC;
