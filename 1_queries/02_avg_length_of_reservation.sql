-- Get the average duration of all reservations.

--   average_duration
-- ---------------------
--  14.6636000000000000
-- (1 row)


SELECT AVG(end_date - start_date) AS average_duration
FROM reservations;

