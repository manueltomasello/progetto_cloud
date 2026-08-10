-- =====================================================================
--  Gestionale Manutenzioni - inizializzazione "database per service"
--  Un unico container PostgreSQL ospita un database dedicato per ogni
--  microservizio, in modo che ciascun servizio sia proprietario esclusivo
--  del proprio schema (nessuna condivisione di tabelle tra servizi).
--  Le tabelle vengono poi generate da Hibernate (ddl-auto=update) e i dati
--  di riferimento sono inseriti dai singoli servizi al primo avvio.
-- =====================================================================

CREATE DATABASE auth_db;
CREATE DATABASE anagrafiche_db;
CREATE DATABASE manutenzioni_db;
CREATE DATABASE fatturazione_db;
