SELECT res.id, prop.title, res.start_date, prop.cost_per_night,
  AVG(rev.rating) AS average_rating
FROM reservations res
JOIN properties prop
  ON prop.id = res.property_id
LEFT JOIN property_reviews rev
  ON prop.id = rev.property_id
WHERE res.guest_id = 1 -- Change id here for different guest
GROUP BY res.id, prop.id
ORDER BY res.start_date
LIMIT 10;