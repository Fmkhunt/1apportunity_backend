-- Update the coordinates column in hunts table from text to geography type
ALTER TABLE hunts
  ALTER COLUMN coordinates TYPE geography USING ST_GeographyFromText(coordinates);