drop table if EXISTS notes_tags;
drop table if EXISTS notes;
drop table if EXISTS folders;
drop table if EXISTS tags;

create table folders (
  id serial PRIMARY KEY,
  name text NOT NULL
);

create table notes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  folder_id INT REFERENCES folders on DELETE SET NULL
);

create TABLE tags (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE
);

create TABLE notes_tags (
  note_id INTEGER not null REFERENCES notes on delete CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags on DELETE CASCADE
);

ALTER SEQUENCE folders_id_seq RESTART WITH 1000;
ALTER SEQUENCE notes_id_seq RESTART WITH 10000;
ALTER SEQUENCE tags_id_seq RESTART WITH 100;

insert into folders (name) VALUES
  ('Archive'),
  ('Drafts'),
  ('Personal'),
  ('Work');

insert into notes (title, content, folder_id) VALUES
  ('bookish', 'hot', 1001),
  ('glasses', 'hotter', 1002),
  ('tall', 'hotter still', 1000),
  ('tall6', 'hotter still', 1003),
  ('tall5', 'hotter still', 1002),
  ('tall4', 'hotter still', 1001),
  ('tall1', 'hotter still', 1002),
  ('tall3', 'hotter still', 1003),
  ('tall2', 'hotter still', 1003),
  ('ginger', 'on fire', 1001);

insert into tags (name) VALUES
  ('shopping'),
  ('memo'),
  ('remainder'),
  ('list');

insert into notes_tags (note_id, tag_id) VALUES
  (10001, 100),
  (10001, 101),
  (10000, 100),
  (10002, 102),
  (10003, 103);