ALTER TABLE "workflow_schedule" ADD COLUMN "lifecycle" text DEFAULT 'persistent' NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_schedule" ADD COLUMN "success_condition" text;--> statement-breakpoint
ALTER TABLE "workflow_schedule" ADD COLUMN "max_runs" integer;--> statement-breakpoint
ALTER TABLE "workflow_schedule" ADD COLUMN "run_count" integer DEFAULT 0 NOT NULL;