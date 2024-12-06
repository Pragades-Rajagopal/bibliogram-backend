create or replace VIEW note_vw AS
 select
    n.id,
    n.user_id,
    n.book_id,
    n.note,
    n.is_private,
    n.created_on,
    n.modified_on,
    u.fullname as user,
    b.name as book_name,
    b.author,
    (
    select
      COUNT(1)
    from
      comment c
    where
      c.note_id = n.id
        ) as comments,
    TO_CHAR(n.modified_on,
    'DD') || ' ' || TO_CHAR(n.modified_on,
    'Mon') as short_date
  from
    note n
  join user_table u on
    n.user_id = u.id
  join book b on
    n.book_id = b.id