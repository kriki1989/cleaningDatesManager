SELECT buildings.id, buildings.name, buildings.code, building_types.name FROM buildings
LEFT JOIN building_types ON building_types.id = buildings.building_type_id
ORDER BY buildings.id;