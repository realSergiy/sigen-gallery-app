-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "photos" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"url" varchar(255) NOT NULL,
	"extension" varchar(255) NOT NULL,
	"aspect_ratio" real DEFAULT 1.5,
	"blur_data" text,
	"title" varchar(255),
	"caption" text,
	"semantic_description" text,
	"tags" varchar(255)[],
	"make" varchar(255),
	"model" varchar(255),
	"focal_length" smallint,
	"focal_length_in_35mm_format" smallint,
	"lens_make" varchar(255),
	"lens_model" varchar(255),
	"f_number" real,
	"iso" smallint,
	"exposure_time" double precision,
	"exposure_compensation" real,
	"location_name" varchar(255),
	"latitude" double precision,
	"longitude" double precision,
	"film_simulation" varchar(255),
	"priority_order" real,
	"taken_at" timestamp with time zone NOT NULL,
	"taken_at_naive" varchar(255) NOT NULL,
	"hidden" boolean,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "video_mask" (
	"id" integer PRIMARY KEY NOT NULL,
	"video_id" varchar(8) NOT NULL,
	"bitmask" integer NOT NULL,
	"name" varchar(255) DEFAULT '' NOT NULL,
	"video_url" varchar(255),
	CONSTRAINT "check_video_url" CHECK ((video_url)::text ~ '^https://.+\.[A-Za-z0-9]+$'::text)
);
--> statement-breakpoint
CREATE TABLE "video" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"url" varchar(255) NOT NULL,
	"extension" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"caption" text NOT NULL,
	"tags" varchar(255)[] NOT NULL,
	"location_name" varchar(255) DEFAULT ''::character varying(255) NOT NULL,
	"taken_at" timestamp with time zone NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"video_url" varchar(255),
	CONSTRAINT "check_url" CHECK ((url)::text ~ '^https://.+\.[A-Za-z0-9]+$'::text),
	CONSTRAINT "check_video_url" CHECK ((video_url)::text ~ '^https://.+\.[A-Za-z0-9]+$'::text)
);
--> statement-breakpoint
ALTER TABLE "video_mask" ADD CONSTRAINT "video_mask_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("id") ON DELETE cascade ON UPDATE cascade;
*/