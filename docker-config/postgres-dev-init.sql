CREATE USER adonis with encrypted password 'adonis';
CREATE DATABASE adonis_app;
GRANT ALL PRIVILEGES ON DATABASE adonis_app TO adonis;

CREATE DATABASE test;
GRANT ALL PRIVILEGES ON DATABASE test TO adonis;