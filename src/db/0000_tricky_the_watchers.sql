-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
create table if not exists photos
(
    id                          varchar(8)               not null
        primary key,
    url                         varchar(255)             not null,
    extension                   varchar(255)             not null,
    aspect_ratio                real                     default 1.5,
    blur_data                   text,
    title                       varchar(255),
    caption                     text,
    semantic_description        text,
    tags                        varchar(255)[],
    make                        varchar(255),
    model                       varchar(255),
    focal_length                smallint,
    focal_length_in_35mm_format smallint,
    lens_make                   varchar(255),
    lens_model                  varchar(255),
    f_number                    real,
    iso                         smallint,
    exposure_time               double precision,
    exposure_compensation       real,
    location_name               varchar(255),
    latitude                    double precision,
    longitude                   double precision,
    film_simulation             varchar(255),
    priority_order              real,
    taken_at                    timestamp with time zone not null,
    taken_at_naive              varchar(255)             not null,
    hidden                      boolean,
    updated_at                  timestamp with time zone default CURRENT_TIMESTAMP,
    created_at                  timestamp with time zone default CURRENT_TIMESTAMP
);

create table if not exists videos
(
    id                          varchar(8)               not null
        primary key,
    url                         varchar(255)             not null,
    extension                   varchar(255)             not null,
    aspect_ratio                real                     default 1.5,
    title                       varchar(255),
    caption                     text,
    semantic_description        text,
    tags                        varchar(255)[],
    location_name               varchar(255),
    latitude                    double precision,
    longitude                   double precision,
    film_simulation             varchar(255),
    priority_order              real,
    taken_at                    timestamp with time zone not null,
    taken_at_naive              varchar(255)             not null,
    hidden                      boolean,
    updated_at                  timestamp with time zone default CURRENT_TIMESTAMP,
    created_at                  timestamp with time zone default CURRENT_TIMESTAMP
);

*/