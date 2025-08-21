# Hunt Service Coordinates Implementation

## Overview

This document explains the implementation of coordinate handling in the Hunt Service. The service now uses PostgreSQL's native geography type and spatial functions to efficiently extract latitude and longitude from stored coordinates.

## Key Changes

1. **Schema Update**: Changed the `coordinates` column from `text` to `geography` type in the database schema.

2. **Database Migration**: Added a migration file (`0001_update_coordinates_to_geography.sql`) to convert existing text coordinates to the geography type.

3. **Coordinate Storage**: Updated the `coordinatesToWKT` method to properly format coordinates with SRID for PostgreSQL geography type.

4. **Database-Level Extraction**: Implemented PostgreSQL's `ST_X` and `ST_Y` functions to extract longitude and latitude directly from the database, eliminating the need for client-side parsing of binary data.

## How It Works

1. When coordinates are stored (in `create` and `update` methods), they are converted to the proper WKT format with SRID=4326 (WGS84).

2. When retrieving hunt data, the service uses PostgreSQL's spatial functions to extract coordinates:
   ```sql
   jsonb_build_object(
     'latitude', ST_Y(coordinates::geometry),
     'longitude', ST_X(coordinates::geometry)
   )
   ```

3. This approach eliminates the need to parse complex binary geography data in the application code.

## Migration Steps

To apply these changes to an existing database:

1. Run the migration script:
   ```
   npm run db:migrate
   ```

2. Restart the Hunt Service application.

## Benefits

- More efficient coordinate extraction
- Elimination of complex binary parsing in application code
- Better data type safety
- Ability to use PostgreSQL's spatial functions for future geospatial queries