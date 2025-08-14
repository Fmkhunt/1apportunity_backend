CREATE TABLE admin
(
    id uuid NOT NULL,
    email varchar(200),
    password varchar(200),
    role VARCHAR(50) DEFAULT 'manager' CHECK (status IN ('admin', 'manager')),
    area GEOMETRY(POLYGON, 4326),
    permissions jsonb[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
