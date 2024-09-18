alter table "article_categories" enable row level security;
create policy "article categories are viewable"
on article_categories for select
to anon         
using ( true ); 

alter table "blog_articles" enable row level security;
create policy "blog articles are viewable"
on blog_articles for select
to anon         
using ( true ); 

alter table "blog_categories" enable row level security;
create policy "blog categories are viewable"
on blog_categories for select
to anon         
using ( true ); 

alter table "book_notes" enable row level security;
create policy "book_notes are selectable only by their user"
on book_notes for select using ( (select auth.uid()) = user_id );
create policy "book_notes are deletable only by their user"
on book_notes for delete using ( (select auth.uid()) = user_id );
create policy "book_notes are updatable only by their user"
on book_notes for update using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id ); 
create policy "book_notes are insertable only by their user"
on book_notes for insert with check ( (select auth.uid()) = user_id ); 

alter table "books" enable row level security;
create policy "books are viewable"
on books for select
to anon         
using ( true ); 
create policy "books are insertable only by their user"
on books for insert to anon with check (true);

alter table "books_like" enable row level security;
create policy "books like are viewable"
on books_like for select
to anon         
using ( true ); 

alter table "friends" enable row level security;

alter table "libraries" enable row level security;
create policy "libraries are viewable"
on libraries for select
to anon         
using ( true );

alter table "messages" enable row level security;

alter table "point_transactions" enable row level security;
create policy "point_transactions are selectable only by their user"
on point_transactions for select using ( (select auth.uid()) = user_id );
create policy "point_transactions are deletable only by their user"
on point_transactions for delete using ( (select auth.uid()) = user_id );
create policy "point_transactions are updatable only by their user"
on point_transactions for update using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id ); 
create policy "point_transactions are insertable only by their user"
on point_transactions for insert with check ( (select auth.uid()) = user_id );

alter table "reading_stats" enable row level security;
create policy "reading_stats are selectable only by their user"
on reading_stats for select using ( (select auth.uid()) = user_id );
create policy "reading_stats are deletable only by their user"
on reading_stats for delete using ( (select auth.uid()) = user_id );
create policy "reading_stats are updatable only by their user"
on reading_stats for update using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id ); 
create policy "reading_stats are insertable only by their user"
on reading_stats for insert with check ( (select auth.uid()) = user_id );

alter table "reading_list" enable row level security;
create policy "reading_list are selectable only by their user"
on reading_list for select using ( (select auth.uid()) = user_id );
create policy "reading_list are deletable only by their user"
on reading_list for delete using ( (select auth.uid()) = user_id );
create policy "reading_list are updatable only by their user"
on reading_list for update using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id ); 
create policy "reading_list are insertable only by their user"
on reading_list for insert with check ( (select auth.uid()) = user_id );

alter table "user_activity" enable row level security;
create policy "user_activity are selectable only by their user"
on user_activity for select using ( (select auth.uid()) = user_id );
create policy "user_activity are deletable only by their user"
on user_activity for delete using ( (select auth.uid()) = user_id );
create policy "user_activity are updatable only by their user"
on user_activity for update using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id ); 
create policy "user_activity are insertable only by their user"
on user_activity for insert with check ( (select auth.uid()) = user_id );

alter table "user_point_streak" enable row level security;
create policy "user_point_streak are selectable only by their user"
on user_point_streak for select using ( (select auth.uid()) = user_id );
create policy "user_point_streak are deletable only by their user"
on user_point_streak for delete using ( (select auth.uid()) = user_id );
create policy "user_point_streak are updatable only by their user"
on user_point_streak for update using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id ); 
create policy "user_point_streak are insertable only by their user"
on user_point_streak for insert with check ( (select auth.uid()) = user_id );

alter table "user_points" enable row level security;
create policy "user_points are selectable only by their user"
on user_points for select using ( (select auth.uid()) = user_id );
create policy "user_points are deletable only by their user"
on user_points for delete using ( (select auth.uid()) = user_id );
create policy "user_points are updatable only by their user"
on user_points for update using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id ); 
create policy "user_points are insertable only by their user"
on user_points for insert with check ( (select auth.uid()) = user_id );

alter table "user_preferences" enable row level security;
create policy "user_preferences are selectable only by their user"
on user_preferences for select using ( (select auth.uid()) = user_id );
create policy "user_preferences are deletable only by their user"
on user_preferences for delete using ( (select auth.uid()) = user_id );
create policy "user_preferences are updatable only by their user"
on user_preferences for update using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id ); 
create policy "user_preferences are insertable only by their user"
on user_preferences for insert with check ( (select auth.uid()) = user_id );
