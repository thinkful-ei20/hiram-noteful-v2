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
  ('train', 'cool', 1001),
  ('airplane', 'cooler', 1002),
  ('car', 'cooler still', 1000),
  ('cooler', 'bad guy', 1003),
  ('king cold', 'coolers dad', 1002),
  ('snow cone', 'shaved ice', 1001),
  ('conehead', 'funny', 1002),
  ('americas funneist home videos', 'old', 1003),
  ('old', 'young', 1003),
  ('word association', 'is stupid', 1001);

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