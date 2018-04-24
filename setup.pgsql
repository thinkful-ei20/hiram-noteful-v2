drop table if EXISTS notes;

create table notes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER SEQUENCE notes_id_seq START 1000 RESTART;

insert into notes (title, content) VALUES ('bookish', 'hot');
insert into notes (title, content) VALUES ('glasses', 'hotter');
insert into notes (title, content) VALUES ('tall', 'hotter still');
insert into notes (title, content) VALUES ('ginger', 'on fire');