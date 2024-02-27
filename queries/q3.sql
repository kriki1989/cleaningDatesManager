SELECT 
    crew_cleaning.id,
    buildings.id AS building_id, 
    buildings.name, 
    buildings.code, 
    building_types.name AS building_type, 
    DATE_FORMAT(crew_cleaning.date, '%d-%m-%Y') AS date, 
    cleaning_types.name AS cleaning_type, 
    cleaning_types.color 
FROM 
    buildings
LEFT JOIN 
    building_types ON buildings.building_type_id = building_types.id
LEFT JOIN 
    crew_cleaning ON buildings.id = crew_cleaning.building_id
LEFT JOIN 
    cleaning_types ON crew_cleaning.cleaning_type_id = cleaning_types.id
LEFT JOIN 
	 buildings_statuses ON buildings.id = buildings_statuses.building_id
WHERE 
    ((crew_cleaning.date >= '2024-01-01' AND crew_cleaning.date <= '2024-02-29') OR crew_cleaning.date IS NULL) 
    AND (buildings_statuses.status = 'Active' AND buildings_statuses.from < '2024-02-02' AND '2024-02-02' < buildings_statuses.to)
ORDER BY building_id ASC;