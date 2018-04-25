drop table if EXISTS notes;
drop table if EXISTS folders;

create table folders (
  id serial PRIMARY KEY,
  name text NOT NULL
);

ALTER SEQUENCE folders_id_seq RESTART WITH 100;

insert into folders (name) VALUES
  ('Archive'),
  ('Drafts'),
  ('Personal'),
  ('Work');

create table notes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  folder_id INT REFERENCES folders on DELETE SET NULL
);

ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

insert into notes (title, content, folder_id) VALUES ('bookish', 'hot', 100);
insert into notes (title, content, folder_id) VALUES ('glasses', 'hotter', 101);
insert into notes (title, content, folder_id) VALUES ('tall', 'hotter still', 101);
insert into notes (title, content, folder_id) VALUES ('ginger', 'on fire', 103);