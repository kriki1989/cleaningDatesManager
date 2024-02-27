SELECT buildings.id, buildings.name, buildings.code, building_types.name FROM buildings
INNER JOIN building_types
ON buildings.building_type_id = building_types.id;
