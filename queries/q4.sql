SELECT cleaning_types.name AS cleaningTypes, building_types.name AS buildingTypes, cleaning_costs.cost FROM cleaning_costs
INNER JOIN cleaning_types ON cleaning_costs.cleaning_type_id = cleaning_types.id
INNER JOIN building_types ON cleaning_costs.building_type_id = building_types.id
ORDER BY cleaningTypes ASC;