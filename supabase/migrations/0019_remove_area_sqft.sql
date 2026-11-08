-- Square-foot measurements are no longer part of the ToletZoo listing workflow.
alter table public.listings drop column if exists area_sqft;
