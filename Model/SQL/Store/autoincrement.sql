SELECT ID, COUNT(*) 
FROM inscripciones 
GROUP BY ID 
HAVING COUNT(*) > 1;