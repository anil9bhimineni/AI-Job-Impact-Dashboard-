-- Resolve initial security/performance advisor findings.

create index salary_observations_location_id_idx
  on public.salary_observations (location_id)
  where location_id is not null;

create index watchlists_location_id_idx
  on public.watchlists (location_id)
  where location_id is not null;

drop policy widgets_public_read on public.embeddable_widgets;
drop policy widgets_creator_all on public.embeddable_widgets;

create policy widgets_anon_read on public.embeddable_widgets
for select to anon
using (is_active);

create policy widgets_authenticated_read on public.embeddable_widgets
for select to authenticated
using (is_active or created_by = (select auth.uid()));

create policy widgets_creator_insert on public.embeddable_widgets
for insert to authenticated
with check (created_by = (select auth.uid()));

create policy widgets_creator_update on public.embeddable_widgets
for update to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

create policy widgets_creator_delete on public.embeddable_widgets
for delete to authenticated
using (created_by = (select auth.uid()));
