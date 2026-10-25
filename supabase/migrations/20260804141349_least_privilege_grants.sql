-- Supabase projects may retain legacy default grants. Reset them, then expose only the intended API surface.

revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

grant select on public.data_sources, public.occupations, public.occupation_aliases, public.locations,
  public.employers, public.skills, public.occupation_skills, public.score_versions, public.occupation_scores,
  public.vacancy_observations, public.salary_observations, public.employer_events, public.education_pathways,
  public.course_recommendations, public.content_translations, public.change_events, public.embeddable_widgets
to anon, authenticated;

grant select, insert, update, delete on public.profiles, public.saved_roles, public.saved_comparisons,
  public.watchlists, public.alert_preferences, public.transition_plans, public.transition_steps,
  public.cohorts, public.cohort_members, public.embeddable_widgets
to authenticated;

grant select, insert on public.skill_simulations, public.quiz_results, public.referral_events,
  public.score_disputes, public.report_exports
to authenticated;

grant select on public.alert_deliveries, public.institutions, public.institution_members to authenticated;

grant select (id, institution_id, name, key_prefix, scopes, rate_limit_per_minute, last_used_at, revoked_at, created_at)
  on public.api_clients to authenticated;

grant insert on public.quiz_results, public.referral_events, public.score_disputes to anon;

grant usage, select on all sequences in schema public to authenticated, service_role;
grant usage, select on sequence public.quiz_results_id_seq, public.referral_events_id_seq,
  public.score_disputes_id_seq to anon;

grant all privileges on all tables in schema public to service_role;
