SELECT 
    crew_cleaning.id, 
    buildings.id as building_id, 
    buildings.name, 
    buildings.code, 
    building_types.name AS building_type, 
    DATE_FORMAT(crew_cleaning.date, '%d-%m-%Y') AS date, 
    cleaning_types.name AS cleaning_type, 
    cleaning_types.color 
FROM 
    crew_cleaning
INNER JOIN 
    buildings ON crew_cleaning.building_id = buildings.id
INNER JOIN 
    building_types ON buildings.building_type_id = building_types.id
INNER JOIN 
    cleaning_types ON crew_cleaning.cleaning_type_id = cleaning_types.id
WHERE 
    crew_cleaning.date >= '2024-01-01' AND crew_cleaning.date <= '2024-02-29'
ORDER BY building_id ASC;