/* =======================================================================
   Gestionale Manutenzioni - SCHEMA per Microsoft SQL Server
   Convertito da MariaDB 11.7 (gestionale_manutenzioni.sql).

   Note di conversione principali:
   - backtick `...`           -> brackets [...]
   - INT(11), INT(3) ecc.     -> INT (la lunghezza in T-SQL e' decorativa, semplificato)
   - VARCHAR / TEXT           -> NVARCHAR / NVARCHAR(MAX) (Unicode nativo)
   - TINYINT(1) (bool MySQL)  -> BIT
   - TINYINT(4) (origin)      -> TINYINT
   - ENUM(...)                -> NVARCHAR + CHECK constraint
   - AUTO_INCREMENT           -> IDENTITY(seed,1)
   - DEFAULT curdate()        -> DEFAULT CAST(GETDATE() AS DATE)
   - utf8mb4                  -> collation Latin1_General_100_CI_AS_SC_UTF8 a livello DB

   Per inserire i dati storici provenienti da MariaDB usare lo script
   backend/scripts/migrate-mariadb-to-mssql.ts (vedi MIGRATION_GUIDE.md).
   ======================================================================= */

/* ----------------------------------------------------------------------
   1. Database
   ---------------------------------------------------------------------- */
IF DB_ID(N'gestionale_manutenzioni') IS NULL
BEGIN
    CREATE DATABASE [gestionale_manutenzioni]
        COLLATE Latin1_General_100_CI_AS_SC_UTF8;
END
GO

USE [gestionale_manutenzioni];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO

/* ----------------------------------------------------------------------
   2. Drop (idempotente) - esegue solo se serve ricreare da zero
   ---------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.fatture', N'U')               IS NOT NULL DROP TABLE dbo.fatture;
IF OBJECT_ID(N'dbo.interventi_articoli', N'U')   IS NOT NULL DROP TABLE dbo.interventi_articoli;
IF OBJECT_ID(N'dbo.interventi_dipendenti', N'U') IS NOT NULL DROP TABLE dbo.interventi_dipendenti;
IF OBJECT_ID(N'dbo.interventi_esterni', N'U')    IS NOT NULL DROP TABLE dbo.interventi_esterni;
IF OBJECT_ID(N'dbo.interventi', N'U')            IS NOT NULL DROP TABLE dbo.interventi;
IF OBJECT_ID(N'dbo.manutenzioni', N'U')          IS NOT NULL DROP TABLE dbo.manutenzioni;
IF OBJECT_ID(N'dbo.articoli_consumabili', N'U')  IS NOT NULL DROP TABLE dbo.articoli_consumabili;
IF OBJECT_ID(N'dbo.cause_guasto', N'U')          IS NOT NULL DROP TABLE dbo.cause_guasto;
IF OBJECT_ID(N'dbo.fornitore', N'U')             IS NOT NULL DROP TABLE dbo.fornitore;
IF OBJECT_ID(N'dbo.risorsa', N'U')               IS NOT NULL DROP TABLE dbo.risorsa;
IF OBJECT_ID(N'dbo.operatore', N'U')             IS NOT NULL DROP TABLE dbo.operatore;
GO

/* ----------------------------------------------------------------------
   3. Tabelle anagrafiche (senza FK in ingresso)
   ---------------------------------------------------------------------- */

/* -- operatore -------------------------------------------------------- */
CREATE TABLE dbo.operatore (
    [IdDip]        INT            IDENTITY(18755, 1) NOT NULL,
    [Matricola]    INT            NOT NULL,
    [NomeDip]      NVARCHAR(100)  NOT NULL,
    [CognDip]      NVARCHAR(100)  NOT NULL,
    [EmailDip]     NVARCHAR(150)  NULL,
    [PassDip]      NVARCHAR(255)  NOT NULL,
    [CostoOrario]  DECIMAL(10, 2) NOT NULL CONSTRAINT DF_operatore_CostoOrario DEFAULT (0.00),
    [ruolo]        NVARCHAR(10)   NOT NULL CONSTRAINT DF_operatore_ruolo      DEFAULT (N'user'),
    [username]     NVARCHAR(50)   NOT NULL,
    [abilitato]    TINYINT        NOT NULL CONSTRAINT DF_operatore_abilitato  DEFAULT (1),
    CONSTRAINT PK_operatore           PRIMARY KEY CLUSTERED ([IdDip]),
    CONSTRAINT UQ_operatore_username  UNIQUE ([username]),
    CONSTRAINT CK_operatore_ruolo     CHECK ([ruolo] IN (N'admin', N'user'))
);
GO

/* -- risorsa ---------------------------------------------------------- */
CREATE TABLE dbo.risorsa (
    [NomeRisorsa]      INT            NOT NULL,
    [ModMacc]          NVARCHAR(100)  NOT NULL,
    [DescMacc]         NVARCHAR(MAX)  NULL,
    [CostoOrarioFermo] DECIMAL(10, 2) NOT NULL CONSTRAINT DF_risorsa_CostoOrarioFermo DEFAULT (0.00),
    CONSTRAINT PK_risorsa PRIMARY KEY CLUSTERED ([NomeRisorsa])
);
GO

/* -- fornitore -------------------------------------------------------- */
CREATE TABLE dbo.fornitore (
    [IdFornitore] NVARCHAR(5)   NOT NULL,
    [RagSoc]      NVARCHAR(100) NOT NULL,
    CONSTRAINT PK_fornitore PRIMARY KEY CLUSTERED ([IdFornitore])
);
GO

/* -- cause_guasto ----------------------------------------------------- */
CREATE TABLE dbo.cause_guasto (
    [IdGuasto]    INT           IDENTITY(10, 1) NOT NULL,
    [Descrizione] NVARCHAR(255) NOT NULL,
    CONSTRAINT PK_cause_guasto PRIMARY KEY CLUSTERED ([IdGuasto])
);
GO

/* -- articoli_consumabili --------------------------------------------- */
CREATE TABLE dbo.articoli_consumabili (
    [Articolo]       INT            IDENTITY(18, 1) NOT NULL,
    [NomeArt]        NVARCHAR(100)  NOT NULL,
    [DescArtBreve]   NVARCHAR(MAX)  NULL,
    [DescArtLunga]   NVARCHAR(MAX)  NULL,
    [Udm]            NVARCHAR(10)   NOT NULL CONSTRAINT DF_articoli_Udm            DEFAULT (N'pezzi'),
    [PrezzoStandard] DECIMAL(10, 2) NOT NULL CONSTRAINT DF_articoli_PrezzoStandard DEFAULT (0.00),
    CONSTRAINT PK_articoli_consumabili PRIMARY KEY CLUSTERED ([Articolo]),
    CONSTRAINT CK_articoli_Udm CHECK ([Udm] IN (N'pezzi', N'litri', N'kg', N'metri', N'altro'))
);
GO

/* ----------------------------------------------------------------------
   4. Tabelle dipendenti da anagrafiche
   ---------------------------------------------------------------------- */

/* -- manutenzioni ----------------------------------------------------- */
CREATE TABLE dbo.manutenzioni (
    [ManId]           INT           IDENTITY(36, 1) NOT NULL,
    [MaccIdMan]       INT           NOT NULL,
    [Tipo]            NVARCHAR(20)  NOT NULL,
    [FreqGiorni]      INT           NULL,
    [DescMan]         NVARCHAR(MAX) NULL,
    [noteMan]         NVARCHAR(MAX) NULL,
    [DataInserimento] DATE          NOT NULL CONSTRAINT DF_manutenzioni_DataInserimento DEFAULT (CAST(GETDATE() AS DATE)),
    [DurataSTAT]      INT           NOT NULL CONSTRAINT DF_manutenzioni_DurataSTAT      DEFAULT (0),
    CONSTRAINT PK_manutenzioni     PRIMARY KEY CLUSTERED ([ManId]),
    CONSTRAINT CK_manutenzioni_Tipo CHECK ([Tipo] IN (N'Conduzione', N'Guasto', N'Miglioramento', N'Preventiva', N'Uscita Esterna')),
    CONSTRAINT FK_manutenzioni_risorsa FOREIGN KEY ([MaccIdMan]) REFERENCES dbo.risorsa ([NomeRisorsa])
);
GO
CREATE INDEX IX_manutenzioni_MaccIdMan ON dbo.manutenzioni ([MaccIdMan]);
GO

/* -- interventi -------------------------------------------------------
   Nota: IntId e' una stringa formato "INT-YY-NNNNN", non IDENTITY.
   ManId puo' valere 0 (riga "statistica" su manutenzioni), per cui la
   FK su manutenzioni e' DEFINITA ma il record con ManId=0 va creato
   prima di alimentare interventi (vedi 6. Seed).
   ---------------------------------------------------------------------- */
CREATE TABLE dbo.interventi (
    [IntId]          NVARCHAR(15) NOT NULL,
    [ManId]          INT          NOT NULL CONSTRAINT DF_interventi_ManId        DEFAULT (0),
    [DataIntPrev]    DATE         NOT NULL,
    [DataIntEff]     DATE         NULL,
    [TmpInt]         INT          NULL,
    [OraInizio]      TIME(0)      NULL,
    [OraFine]        TIME(0)      NULL,
    [EsitoMan]       BIT          NOT NULL,
    [ValidataMan]    BIT          NOT NULL CONSTRAINT DF_interventi_ValidataMan  DEFAULT (0),
    [noteIntervento] NVARCHAR(MAX) NULL,
    [TipoGuastoId]   INT          NULL,
    [OriginInt]      TINYINT      NOT NULL CONSTRAINT DF_interventi_OriginInt    DEFAULT (0),
    [NomeRisorsaInt] INT          NOT NULL,
    CONSTRAINT PK_interventi PRIMARY KEY CLUSTERED ([IntId]),
    CONSTRAINT FK_interventi_manutenzioni FOREIGN KEY ([ManId])         REFERENCES dbo.manutenzioni ([ManId]),
    CONSTRAINT FK_interventi_cause_guasto FOREIGN KEY ([TipoGuastoId])  REFERENCES dbo.cause_guasto ([IdGuasto]),
    CONSTRAINT FK_interventi_risorsa      FOREIGN KEY ([NomeRisorsaInt]) REFERENCES dbo.risorsa ([NomeRisorsa])
);
GO
CREATE INDEX IX_interventi_ManId         ON dbo.interventi ([ManId]);
CREATE INDEX IX_interventi_TipoGuastoId  ON dbo.interventi ([TipoGuastoId]);
CREATE INDEX IX_interventi_NomeRisorsaInt ON dbo.interventi ([NomeRisorsaInt]);
CREATE INDEX IX_interventi_DataIntPrev   ON dbo.interventi ([DataIntPrev]);
GO

/* -- fatture ---------------------------------------------------------- */
CREATE TABLE dbo.fatture (
    [NFatt]    NVARCHAR(50)   NOT NULL,
    [IntId]    NVARCHAR(15)   NOT NULL,
    [ImpFatt]  DECIMAL(10, 2) NOT NULL,
    [NoteFatt] NVARCHAR(MAX)  NULL,
    CONSTRAINT PK_fatture           PRIMARY KEY CLUSTERED ([NFatt]),
    CONSTRAINT FK_fatture_interventi FOREIGN KEY ([IntId]) REFERENCES dbo.interventi ([IntId])
);
GO
CREATE INDEX IX_fatture_IntId ON dbo.fatture ([IntId]);
GO

/* -- interventi_articoli (junction) ---------------------------------- */
CREATE TABLE dbo.interventi_articoli (
    [IntId] NVARCHAR(15) NOT NULL,
    [ArtId] INT          NOT NULL,
    [qta]   INT          NOT NULL,
    CONSTRAINT PK_interventi_articoli PRIMARY KEY CLUSTERED ([IntId], [ArtId]),
    CONSTRAINT FK_interventi_articoli_int FOREIGN KEY ([IntId]) REFERENCES dbo.interventi ([IntId]),
    CONSTRAINT FK_interventi_articoli_art FOREIGN KEY ([ArtId]) REFERENCES dbo.articoli_consumabili ([Articolo])
);
GO
CREATE INDEX IX_interventi_articoli_ArtId ON dbo.interventi_articoli ([ArtId]);
GO

/* -- interventi_dipendenti (junction) -------------------------------- */
CREATE TABLE dbo.interventi_dipendenti (
    [IntId] NVARCHAR(15) NOT NULL,
    [IdDip] INT          NOT NULL,
    CONSTRAINT PK_interventi_dipendenti PRIMARY KEY CLUSTERED ([IntId], [IdDip]),
    CONSTRAINT FK_interventi_dipendenti_int FOREIGN KEY ([IntId]) REFERENCES dbo.interventi ([IntId]),
    CONSTRAINT FK_interventi_dipendenti_op  FOREIGN KEY ([IdDip]) REFERENCES dbo.operatore ([IdDip])
);
GO
CREATE INDEX IX_interventi_dipendenti_IdDip ON dbo.interventi_dipendenti ([IdDip]);
GO

/* -- interventi_esterni (junction) ----------------------------------- */
CREATE TABLE dbo.interventi_esterni (
    [IntId]       NVARCHAR(15) NOT NULL,
    [IdFornitore] NVARCHAR(5)  NOT NULL,
    CONSTRAINT PK_interventi_esterni PRIMARY KEY CLUSTERED ([IntId], [IdFornitore]),
    CONSTRAINT FK_interventi_esterni_int FOREIGN KEY ([IntId])       REFERENCES dbo.interventi ([IntId]),
    CONSTRAINT FK_interventi_esterni_for FOREIGN KEY ([IdFornitore]) REFERENCES dbo.fornitore ([IdFornitore])
);
GO
CREATE INDEX IX_interventi_esterni_IdFornitore ON dbo.interventi_esterni ([IdFornitore]);
GO

/* ----------------------------------------------------------------------
   5. Seed minimo: record "statistica" (NomeRisorsa = 0, ManId = 0)
   ---------------------------------------------------------------------- */
INSERT INTO dbo.risorsa ([NomeRisorsa], [ModMacc], [DescMacc], [CostoOrarioFermo])
VALUES (0, N'statistica', N'statistica', 0.00);

SET IDENTITY_INSERT dbo.manutenzioni ON;
INSERT INTO dbo.manutenzioni ([ManId], [MaccIdMan], [Tipo], [FreqGiorni], [DescMan], [noteMan], [DataInserimento], [DurataSTAT])
VALUES (0, 0, N'Guasto', NULL, N'statistica', N'statistica', '2025-04-23', 0);
SET IDENTITY_INSERT dbo.manutenzioni OFF;
GO

/* ----------------------------------------------------------------------
   6. Fine schema
   ---------------------------------------------------------------------- */
PRINT 'Schema gestionale_manutenzioni creato con successo.';
GO
/* ----------------------------------------------------------------------
   7. Seed: operatore admin
   ---------------------------------------------------------------------- */
SET IDENTITY_INSERT dbo.operatore ON;
INSERT INTO dbo.operatore 
    ([IdDip], [Matricola], [NomeDip], [CognDip], [EmailDip], [PassDip], [CostoOrario], [ruolo], [username], [abilitato])
VALUES 
    (18755, 407394, N'Manuel', N'Tomasello', N'admin.updated@example.com',
     N'$2b$10$OwpqsfKbIQDOfWCBLu3Weumz743e3m8/40vawh.WRPr5kp5aHMlDq',
     30.00, N'admin', N'MTOMASELLO', 1);
SET IDENTITY_INSERT dbo.operatore OFF;
GO

PRINT 'Utente Admin creato con successo (username: MTOMASELLO).';
GO
