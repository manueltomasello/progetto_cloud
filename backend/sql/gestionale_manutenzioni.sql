-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Giu 20, 2025 alle 14:41
-- Versione del server: 11.7.2-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gestionale_manutenzioni`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `articoli_consumabili`
--

CREATE TABLE `articoli_consumabili` (
  `Articolo` int(11) NOT NULL,
  `NomeArt` varchar(100) NOT NULL,
  `DescArtBreve` text DEFAULT NULL,
  `DescArtLunga` text DEFAULT NULL,
  `Udm` enum('pezzi','litri','kg','metri','altro') NOT NULL DEFAULT 'pezzi',
  `PrezzoStandard` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `articoli_consumabili`
--

INSERT INTO `articoli_consumabili` (`Articolo`, `NomeArt`, `DescArtBreve`, `DescArtLunga`, `Udm`, `PrezzoStandard`) VALUES
(1, '145775245', 'Olio per motori diesel', NULL, 'litri', 12.50),
(2, 'UT38753903', 'Filtro aria per macchinario X', NULL, 'pezzi', 8.90),
(3, 'UT95493702', 'Bulloni in acciaio M10', NULL, 'kg', 5.20),
(4, '7574685678', 'Tubo flessibile in gomma', NULL, 'metri', 3.75),
(5, 'UT58308034', 'Guanti protettivi in lattice', NULL, 'pezzi', 2.50),
(6, 'Bullone M10', 'Bullone filettato M10', 'Bullone in acciaio inox con filettatura M10', 'pezzi', 0.50),
(7, 'Olio Visc High', 'Olio sintetico shell', 'Olio lubrificante per alte prestazioni codice in X3 3532535323', 'litri', 15.00),
(8, 'AT3490759', 'Cinghia dentata 1200mm', 'Cinghia per trasmissione industriale', 'metri', 25.00),
(10, '46257895', 'Olio per mandrino', 'Olio lubrificante per mandrino CNC', 'litri', 12.50),
(14, '51283644', 'vite 10', 'vite 10', 'pezzi', 1.00),
(17, '67349242', 'Olio ow30', 'olio per presse ', 'litri', 20.00);

-- --------------------------------------------------------

--
-- Struttura della tabella `cause_guasto`
--

CREATE TABLE `cause_guasto` (
  `IdGuasto` int(11) NOT NULL,
  `Descrizione` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `cause_guasto`
--

INSERT INTO `cause_guasto` (`IdGuasto`, `Descrizione`) VALUES
(1, 'Usura componenti'),
(2, 'Sovraccarico'),
(3, 'Mancanza di lubrificazione'),
(4, 'Guasto elettrico'),
(5, 'Errore operatore'),
(6, 'Usura naturale'),
(7, 'Errore umano'),
(8, 'Guasto Meccanico'),
(9, 'Mancata lubrificazione');

-- --------------------------------------------------------

--
-- Struttura della tabella `fatture`
--

CREATE TABLE `fatture` (
  `NFatt` varchar(50) NOT NULL,
  `IntId` varchar(15) NOT NULL,
  `ImpFatt` decimal(10,2) NOT NULL,
  `NoteFatt` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `fatture`
--

INSERT INTO `fatture` (`NFatt`, `IntId`, `ImpFatt`, `NoteFatt`) VALUES
('001-24T2382', 'INT-25-00001', 245.78, 'Pagamento trasporti'),
('001-24T238256', 'INT-25-00005', 4584.00, 'Urgente per amministrazione'),
('001-24T2390', 'INT-25-00020', 5000.00, 'okk'),
('001-24T2393', 'INT-25-00067', 27980.00, NULL),
('001-24T2395', 'INT-25-00040', 146745.00, NULL),
('001-24T2399', 'INT-25-00067', 20000.00, NULL),
('001-25CL3455345', 'INT-25-00001', 7840.50, 'Pagamento entro 60 giorni'),
('001-25dT2390', 'INT-25-00020', 8332.00, NULL),
('001-25F23904', 'INT-25-00010', 7854.00, 'riba'),
('001-25T238230', 'INT-25-00017', 80000.00, 'pag da segnalare a proprietà'),
('001-25T2384', 'INT-25-00059', 24584.00, NULL),
('001-25T23878', 'INT-25-00007', 5484.00, 'Sentire dal responsabile Contabilità'),
('001-6483', 'INT-25-00089', 3000.00, 'sentire faragò'),
('0232478', 'INT-25-00021', 9000.00, 'sentire faragò per approvazione'),
('040223', 'INT-25-00013', 400.00, NULL),
('123AA252', 'INT-25-00018', 2843.00, NULL),
('123AQA25', 'INT-25-00067', 3434.00, NULL),
('25-4785478', 'INT-25-00015', 2000.00, NULL),
('34409\'2', 'INT-25-00064', 200.00, NULL),
('4598752', 'INT-25-00023', 20000.00, 'fattura per mandrino'),
('478547', 'INT-25-00021', 200.00, 'tutto ok'),
('7875', 'INT-25-00059', 10050.00, NULL),
('FATT-2024-001', 'INT-25-00005', 5000.00, 'Pagamento entro 30gg'),
('FATT_2025_11123A', 'INT-25-00007', 9493.00, 'sentire proprietà ');

-- --------------------------------------------------------

--
-- Struttura della tabella `fornitore`
--

CREATE TABLE `fornitore` (
  `IdFornitore` varchar(5) NOT NULL,
  `RagSoc` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `fornitore`
--

INSERT INTO `fornitore` (`IdFornitore`, `RagSoc`) VALUES
('12345', 'Salami '),
('12587', 'Tecnomat'),
('13200', 'Industrie Riunite S.p.A.'),
('14567', 'Modena Meccanica srl'),
('45623', 'Officine rettifiche carpi'),
('45698', 'Comet'),
('69565', 'Salami  Hydraulics North America'),
('74587', 'Davoli '),
('78945', 'Ferrari S.p.A.'),
('78965', 'Fonderie Piacentine'),
('85200', 'Salami France'),
('F001', 'Meccanica Rossi S.p.A.'),
('F002', 'Elettronica Bianchi S.r.l.'),
('F003', 'Lubrificanti Verdi S.p.A.');

-- --------------------------------------------------------

--
-- Struttura della tabella `interventi`
--

CREATE TABLE `interventi` (
  `IntId` varchar(15) NOT NULL,
  `ManId` int(11) NOT NULL DEFAULT 0,
  `DataIntPrev` date NOT NULL,
  `DataIntEff` date DEFAULT NULL,
  `TmpInt` int(3) DEFAULT NULL,
  `OraInizio` time DEFAULT NULL,
  `OraFine` time DEFAULT NULL,
  `EsitoMan` tinyint(1) NOT NULL,
  `ValidataMan` tinyint(1) DEFAULT 0,
  `noteIntervento` text DEFAULT NULL,
  `TipoGuastoId` int(11) DEFAULT NULL,
  `OriginInt` tinyint(4) DEFAULT 0,
  `NomeRisorsaInt` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `interventi`
--

INSERT INTO `interventi` (`IntId`, `ManId`, `DataIntPrev`, `DataIntEff`, `TmpInt`, `OraInizio`, `OraFine`, `EsitoMan`, `ValidataMan`, `noteIntervento`, `TipoGuastoId`, `OriginInt`, `NomeRisorsaInt`) VALUES
('INT-25-00001', 1, '2024-10-27', '2024-10-28', 0, '08:00:00', '12:00:00', 1, 1, 'Intervento di manutenzione ordinaria.', 2, 0, 0),
('INT-25-00003', 1, '2024-10-27', '2024-10-28', 0, '08:00:00', '12:00:00', 1, 1, 'Intervento di manutenzione ordinaria.', 2, 0, 0),
('INT-25-00005', 1, '2025-04-13', '2024-11-14', 0, '08:00:00', '12:00:00', 1, 1, 'Sostituzione componenti usura', 3, 0, 0),
('INT-25-00006', 8, '2024-11-15', '2024-11-16', 0, '08:00:00', '12:00:00', 1, 1, 'Sostituzione componenti usura', 6, 0, 0),
('INT-25-00007', 8, '2025-04-18', '2024-11-15', 0, '08:00:00', '12:00:00', 1, 1, 'Sostituzione componenti usura', 6, 0, 0),
('INT-25-00008', 9, '2025-04-17', '2025-04-09', 0, '08:00:00', '12:00:00', 1, 0, 'prova', 6, 0, 678),
('INT-25-00009', 9, '2025-04-17', '2025-04-17', 0, '08:00:00', '12:00:00', 0, 0, 'prova', 6, 0, 678),
('INT-25-00010', 9, '2025-04-17', '2025-04-30', 0, '08:00:00', '12:00:00', 0, 1, 'prova', 6, 0, 0),
('INT-25-00011', 9, '2025-04-17', '2025-04-30', 0, '08:00:00', '12:00:00', 0, 0, 'prova', 6, 0, 0),
('INT-25-00013', 9, '2025-04-17', '2025-04-16', 0, '08:00:00', '12:00:00', 1, 1, 'prova', 6, 0, 0),
('INT-25-00015', 1, '2025-05-18', '2025-04-30', 0, '08:00:00', '12:00:00', 1, 1, 'prova 2', 7, 0, 0),
('INT-25-00016', 9, '2025-04-10', '2025-04-11', 0, '08:00:00', '12:00:00', 1, 0, 'Manuel ', 5, 0, 0),
('INT-25-00017', 12, '2025-04-12', '2025-04-02', 0, '08:00:00', '12:00:00', 1, 1, 'tutto ok', NULL, 0, 852),
('INT-25-00018', 13, '2025-04-18', '2025-04-17', 3, '08:00:00', '12:00:00', 1, 1, 'prova', 4, 0, 0),
('INT-25-00019', 12, '2025-04-15', '2025-04-11', 0, '08:00:00', '12:00:00', 1, 1, '', NULL, 0, 0),
('INT-25-00020', 13, '2025-02-14', '2025-11-29', 0, '08:00:00', '12:00:00', 1, 1, 'prova costi', NULL, 0, 0),
('INT-25-00021', 10, '2025-04-07', '2025-04-07', 0, '08:00:00', '12:00:00', 1, 1, 'sentire da Monica se Tomasello c\'è', NULL, 0, 0),
('INT-25-00023', 8, '2025-04-09', '2025-04-09', 0, '08:00:00', '12:00:00', 1, 1, 'aspettare i tecnici dalla germania', 4, 0, 0),
('INT-25-00025', 13, '2025-04-04', '2025-04-15', 0, '08:00:00', '12:00:00', 1, 0, 'In attesa assunzione manuntentore', 3, 0, 0),
('INT-25-00026', 2, '2025-04-04', '2025-05-04', 0, '08:00:00', '12:00:00', 1, 0, 'In attesa assunzione manuntentore', 3, 0, 568),
('INT-25-00027', 12, '2025-04-04', '2025-04-04', 0, '08:00:00', '12:00:00', 1, 0, 'In attesa assunzione manuntentore', 3, 0, 0),
('INT-25-00028', 1, '2025-03-14', NULL, 0, '08:00:00', '12:00:00', 0, 0, 'maiolo porcello \n', NULL, 1, 2),
('INT-25-00029', 2, '2025-12-26', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00030', 8, '2025-10-06', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00032', 11, '2025-04-12', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00033', 12, '2025-04-13', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00034', 13, '2025-11-30', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00035', 14, '2025-04-15', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00036', 18, '2025-05-06', '2025-04-16', 0, '08:00:00', '12:00:00', 1, 0, 'tutto ok', NULL, 1, 0),
('INT-25-00037', 2, '2025-03-29', '2025-03-23', 0, '08:00:00', '12:00:00', 0, 0, 'prova', 4, 0, 0),
('INT-25-00038', 9, '2025-05-14', NULL, 0, '08:00:00', '12:00:00', 0, 1, NULL, NULL, 0, 0),
('INT-25-00039', 18, '2025-05-06', '2025-05-06', 0, '08:00:00', '12:00:00', 1, 0, 'la prova è stata provata', NULL, 1, 0),
('INT-25-00040', 19, '2025-04-17', '2025-04-17', 0, '08:00:00', '12:00:00', 1, 1, 'chiudere acqua stabilimento', 1, 0, 0),
('INT-25-00041', 20, '2025-06-15', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00042', 21, '2025-08-14', '2025-07-15', 0, '08:00:00', '12:00:00', 1, 0, 'tutto ok', NULL, 1, 0),
('INT-25-00043', 21, '2025-11-12', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00044', 22, '2025-10-13', '2025-07-16', 0, '08:00:00', '12:00:00', 1, 0, NULL, NULL, 1, 0),
('INT-25-00045', 22, '2026-01-12', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00049', 23, '2025-06-16', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, NULL, 1, 0),
('INT-25-00050', 0, '2025-04-21', '2025-05-06', 0, '08:00:00', '12:00:00', 1, 0, 'posticipata causa arrivo nuovo responsabile', NULL, 1, 678),
('INT-25-00051', 24, '2025-05-18', '2025-04-14', 0, '08:00:00', '12:00:00', 1, 0, 'tutto ok', NULL, 1, 0),
('INT-25-00052', 10, '2025-04-24', '2025-04-25', 0, '08:00:00', '12:00:00', 1, 0, 'prova', 1, 0, 0),
('INT-25-00053', 2, '2025-05-14', NULL, 0, '08:00:00', '12:00:00', 0, 1, NULL, 5, 0, 0),
('INT-25-00054', 8, '2025-05-14', NULL, 0, '08:00:00', '12:00:00', 0, 0, NULL, 8, 0, 0),
('INT-25-00055', 0, '2025-04-16', '2025-04-16', 2, '08:00:00', '12:00:00', 0, 0, 'prova', NULL, 0, 147),
('INT-25-00056', 0, '2025-04-25', '2025-04-25', 5, '08:00:00', '12:00:00', 1, 0, 'Segnalazione guasto per test', 4, 0, 568),
('INT-25-00057', 0, '2025-04-25', '2025-04-25', 0, '08:00:00', '12:00:00', 1, 0, 'Segnalazione guasto da capoturno', 4, 0, 465),
('INT-25-00058', 0, '2025-05-20', NULL, 0, '08:00:00', '12:00:00', 0, 0, 'prova', 8, 0, 456),
('INT-25-00059', 0, '2025-05-25', '2025-05-25', 3, '08:00:00', '12:00:00', 0, 1, 'prova', 8, 0, 753),
('INT-25-00060', 1, '2026-11-04', NULL, 0, '08:00:00', '12:00:00', 1, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00061', 24, '2025-05-14', NULL, 0, '08:00:00', '12:00:00', 1, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00062', 25, '2025-07-22', NULL, 0, '08:00:00', '12:00:00', 1, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00063', 27, '2025-05-09', NULL, 0, '08:00:00', '12:00:00', 1, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00064', 0, '2025-04-25', '2025-04-25', 4, '08:00:00', '12:00:00', 1, 1, 'calibrazione mandrino', 8, 0, 951),
('INT-25-00065', 28, '2025-10-22', '2025-09-25', 0, '08:00:00', '12:00:00', 1, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00066', 28, '2026-03-24', '2025-03-24', 0, '08:00:00', '12:00:00', 1, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00067', 0, '2025-04-25', '2025-04-25', 4, '08:00:00', '12:00:00', 1, 1, 'prova', 1, 0, 147),
('INT-25-00068', 0, '2025-04-28', '2025-04-28', 10, '08:00:00', '12:00:00', 1, 0, 'cambio ethernet', 1, 0, 147),
('INT-25-00069', 0, '2025-04-29', '2025-04-29', 4, '08:00:00', '12:00:00', 1, 0, 'rimozione ruggine', 1, 0, 852),
('INT-25-00070', 0, '2025-04-10', '2025-04-10', 1, '08:00:00', '12:00:00', 1, 0, 'prova', NULL, 0, 2),
('INT-25-00071', 1, '2025-03-31', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 2),
('INT-25-00072', 1, '2027-04-20', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00073', 2, '2025-12-18', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00074', 9, '2025-07-14', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00075', 11, '2025-06-09', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00076', 12, '2025-06-10', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00077', 13, '2026-01-28', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00078', 14, '2025-07-09', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00079', 18, '2025-10-03', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00080', 20, '2025-08-14', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00081', 27, '2025-06-08', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 147),
('INT-25-00082', 28, '2026-03-24', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00083', 29, '2025-05-20', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00084', 30, '2025-05-29', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00085', 31, '2025-06-01', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00086', 0, '2025-05-07', '2025-05-06', 6, '08:00:00', '12:00:00', 1, 0, 'test ore', 8, 0, 753),
('INT-25-00087', 0, '2025-05-07', '2025-05-07', 3, '08:00:00', '12:00:00', 1, 0, 'riparazione  barriera sicurezza', 7, 0, 852),
('INT-25-00088', 0, '2025-05-08', '2025-05-08', 4, '08:00:00', '12:00:00', 1, 0, 'Rettifica banco', 6, 0, 925),
('INT-25-00089', 0, '2025-05-09', '2025-05-09', 5, '08:00:00', '12:00:00', 1, 1, 'rottura mandrino', 8, 0, 466),
('INT-25-00090', 2, '2026-01-29', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00091', 33, '2025-05-24', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0),
('INT-25-00092', 34, '2025-06-08', NULL, NULL, '08:00:00', '12:00:00', 0, 0, 'intervento generato dal sistema', NULL, 1, 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `interventi_articoli`
--

CREATE TABLE `interventi_articoli` (
  `IntId` varchar(15) NOT NULL,
  `ArtId` int(11) NOT NULL,
  `qta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `interventi_articoli`
--

INSERT INTO `interventi_articoli` (`IntId`, `ArtId`, `qta`) VALUES
('INT-25-00005', 2, 3),
('INT-25-00005', 7, 5),
('INT-25-00007', 2, 3),
('INT-25-00007', 7, 5),
('INT-25-00015', 3, 1),
('INT-25-00015', 6, 3),
('INT-25-00016', 3, 1),
('INT-25-00016', 5, 3),
('INT-25-00018', 3, 1),
('INT-25-00019', 3, 1),
('INT-25-00020', 1, 10),
('INT-25-00021', 3, 2),
('INT-25-00021', 5, 4),
('INT-25-00023', 4, 2),
('INT-25-00027', 2, 1),
('INT-25-00037', 4, 2),
('INT-25-00039', 6, 3),
('INT-25-00040', 14, 12),
('INT-25-00042', 4, 2),
('INT-25-00056', 2, 3),
('INT-25-00056', 7, 1),
('INT-25-00057', 2, 3),
('INT-25-00057', 7, 1),
('INT-25-00058', 4, 1),
('INT-25-00058', 7, 1),
('INT-25-00059', 3, 3),
('INT-25-00059', 6, 2),
('INT-25-00060', 7, 3),
('INT-25-00063', 3, 4),
('INT-25-00064', 6, 2),
('INT-25-00064', 7, 50),
('INT-25-00067', 5, 2),
('INT-25-00068', 4, 1),
('INT-25-00069', 4, 1),
('INT-25-00070', 3, 6),
('INT-25-00089', 6, 3);

-- --------------------------------------------------------

--
-- Struttura della tabella `interventi_dipendenti`
--

CREATE TABLE `interventi_dipendenti` (
  `IntId` varchar(15) NOT NULL,
  `IdDip` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `interventi_dipendenti`
--

INSERT INTO `interventi_dipendenti` (`IntId`, `IdDip`) VALUES
('INT-25-00005', 102),
('INT-25-00007', 102),
('INT-25-00021', 102),
('INT-25-00056', 102),
('INT-25-00057', 102),
('INT-25-00008', 2372),
('INT-25-00009', 2372),
('INT-25-00010', 2372),
('INT-25-00011', 2372),
('INT-25-00013', 2372),
('INT-25-00037', 2372),
('INT-25-00053', 2372),
('INT-25-00064', 2372),
('INT-25-00067', 2372),
('INT-25-00069', 2378),
('INT-25-00052', 3648),
('INT-25-00081', 3648),
('INT-25-00058', 18734),
('INT-25-00064', 18734),
('INT-25-00042', 18736),
('INT-25-00050', 18736),
('INT-25-00059', 18736),
('INT-25-00023', 18737),
('INT-25-00018', 18738),
('INT-25-00055', 18738),
('INT-25-00016', 18740),
('INT-25-00020', 18740),
('INT-25-00021', 18740),
('INT-25-00023', 18740),
('INT-25-00040', 18740),
('INT-25-00068', 18740),
('INT-25-00071', 18740),
('INT-25-00089', 18740),
('INT-25-00039', 18743),
('INT-25-00086', 18745),
('INT-25-00087', 18745),
('INT-25-00088', 18745);

-- --------------------------------------------------------

--
-- Struttura della tabella `interventi_esterni`
--

CREATE TABLE `interventi_esterni` (
  `IntId` varchar(15) NOT NULL,
  `IdFornitore` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `interventi_esterni`
--

INSERT INTO `interventi_esterni` (`IntId`, `IdFornitore`) VALUES
('INT-25-00020', '12587'),
('INT-25-00057', '12587'),
('INT-25-00064', '12587'),
('INT-25-00089', '12587'),
('INT-25-00067', '45623'),
('INT-25-00064', '45698'),
('INT-25-00015', '69565'),
('INT-25-00008', '74587'),
('INT-25-00009', '74587'),
('INT-25-00010', '74587'),
('INT-25-00011', '74587'),
('INT-25-00013', '74587'),
('INT-25-00016', '74587'),
('INT-25-00021', '74587'),
('INT-25-00040', '74587'),
('INT-25-00058', '74587'),
('INT-25-00059', '74587'),
('INT-25-00018', '78945'),
('INT-25-00023', '78965'),
('INT-25-00005', 'F001'),
('INT-25-00007', 'F001');

-- --------------------------------------------------------

--
-- Struttura della tabella `manutenzioni`
--

CREATE TABLE `manutenzioni` (
  `ManId` int(11) NOT NULL,
  `MaccIdMan` int(11) NOT NULL,
  `Tipo` enum('Conduzione','Guasto','Miglioramento','Preventiva','Uscita Esterna') NOT NULL,
  `FreqGiorni` int(11) DEFAULT NULL COMMENT 'Valido solo per manutenzioni regolari',
  `DescMan` text DEFAULT NULL,
  `noteMan` text DEFAULT NULL,
  `DataInserimento` date NOT NULL DEFAULT curdate(),
  `DurataSTAT` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `manutenzioni`
--

INSERT INTO `manutenzioni` (`ManId`, `MaccIdMan`, `Tipo`, `FreqGiorni`, `DescMan`, `noteMan`, `DataInserimento`, `DurataSTAT`) VALUES
(0, 0, 'Guasto', NULL, 'statistica', 'statistica', '2025-04-23', 0),
(1, 2, 'Preventiva', 720, 'Sostituzione mandrino e controllo cinghia', 'Controllare eventuali misure', '2025-03-31', 5),
(2, 568, 'Guasto', 270, 'Riparazione pistoni idraulico', 'Attendere il ricambio prima della sostituzione', '2025-03-31', 0),
(8, 598, 'Conduzione', 180, 'Cambio Frizione', 'Attendere resp acq per approvazione', '2025-04-06', 0),
(9, 678, 'Preventiva', 75, 'revisione attrezzatura con reparto qualità', 'sentire resp qly per approvazione', '2025-04-07', 0),
(10, 568, 'Miglioramento', NULL, 'Inserimento contapezzi', 'sentire IT per collegamento rete', '2025-04-09', 0),
(11, 456, 'Miglioramento', 60, 'prova', 'prova', '2025-04-10', 0),
(12, 852, 'Preventiva', 60, 'cambio olio', 'sentire cipiglio per aspirare olio', '2025-04-10', 0),
(13, 753, 'Preventiva', 60, 'Pulizia Spazi di movimento del braccio', 'dire agli operatori di lasciare la zona di ingombro libera', '2025-04-10', 0),
(14, 147, 'Preventiva', 90, 'cambio filtri', 'sentire da Gennaro per i filtri', '2025-04-10', 0),
(15, 951, 'Guasto', NULL, 'Riparazione mandrino', 'sentire resp finanziario per procedere ', '2025-04-10', 0),
(18, 147, 'Miglioramento', 150, 'prova', 'prova', '2025-04-16', 7),
(19, 912, 'Guasto', NULL, 'si è rotto un tubo dell\'acqua', 'dire a Gennaro di comprare il ricambio', '2025-04-16', 0),
(20, 465, 'Preventiva', 120, 'cambio filtro', 'cambio filtri olio', '2025-04-16', 0),
(21, 568, 'Preventiva', 120, 'cambio filtri', NULL, '2025-04-16', 0),
(22, 568, 'Preventiva', 180, 'cambio cinghia', NULL, '2025-04-16', 0),
(23, 147, 'Preventiva', 60, 'cambio filtri', NULL, '2025-04-17', 0),
(24, 568, 'Preventiva', 30, 'cambio prova', NULL, '2025-04-18', 0),
(25, 568, 'Preventiva', 90, 'Sostituzione liquido raffreddamento', 'Controllare eventuali perdite', '2025-04-23', 2),
(27, 147, 'Preventiva', 45, 'cambio attrezzi', NULL, '2025-04-24', 3),
(28, 465, 'Preventiva', 180, 'cambio bulloni', 'sentire gennaro', '2025-04-25', 5),
(29, 912, 'Miglioramento', 25, 'cambio olio', 'prova', '2025-04-25', 2),
(30, 925, 'Miglioramento', 30, 'Pulizia serbatoio trucioli', NULL, '2025-04-29', 5),
(31, 872, 'Preventiva', 30, 'cambio olio', 'sentire uff acq per acq olio specifico per questa macchina', '2025-05-02', 5),
(33, 466, 'Preventiva', 15, 'cambio olio ', NULL, '2025-05-09', 3),
(34, 147, 'Preventiva', 30, 'cambio olio ', NULL, '2025-05-09', 2);

-- --------------------------------------------------------

--
-- Struttura della tabella `operatore`
--

CREATE TABLE `operatore` (
  `IdDip` int(11) NOT NULL,
  `Matricola` int(10) NOT NULL,
  `NomeDip` varchar(100) NOT NULL,
  `CognDip` varchar(100) NOT NULL,
  `EmailDip` varchar(150) DEFAULT NULL,
  `PassDip` varchar(255) NOT NULL,
  `CostoOrario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ruolo` enum('admin','user') NOT NULL DEFAULT 'user',
  `username` varchar(50) NOT NULL,
  `abilitato` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `operatore`
--

INSERT INTO `operatore` (`IdDip`, `Matricola`, `NomeDip`, `CognDip`, `EmailDip`, `PassDip`, `CostoOrario`, `ruolo`, `username`, `abilitato`) VALUES
(102, 78945, 'Luigi', 'Trentini', 'luigi.bianchi@example.com', 'password456', 22.50, 'user', 'Trentini', 0),
(2372, 0, 'Luigi', 'Campani', 'luigi.verdi@azienda.it', 'password456', 28.00, 'user', 'Campani', 1),
(2378, 30434, 'Mario', 'Rossi', 'mario.rossi@azienda.it', '$2b$10$O2gnwBKv2WDduHDtegX2hevRXyidVcdfqKxTA17rSivm0jDr.ZW9q', 25.00, 'user', 'rossi', 1),
(3648, 0, 'Anna', 'Bianchi', 'anna.bianchi@azienda.it', 'password789', 30.00, 'user', 'Bianchi', 1),
(18734, 0, 'Mario', 'Grigioni', 'mario.rossi@email.com', 'password123', 20.50, 'user', 'Grigioni', 0),
(18736, 407394, 'Emilio', 'Marani', 'emilio.marani@gmail.com', 'newpassword', 30.00, 'user', 'Marani', 1),
(18737, 78945, 'Emilio', 'Romani', '', 'newpassword', 30.00, 'user', 'Romani', 0),
(18738, 456789, 'Manuel', 'Agnelli', 'giuseppe.bianchi.updated@example.com', 'newpassword', 30.00, 'user', 'Agnelli', 1),
(18739, 456789, 'Federico', 'Della Rosa', 'giuseppe.bianchi.updated@example.com', 'newpassword', 30.00, 'user', 'Della Rosa', 1),
(18740, 10110, 'Manuel', 'Tomasello', 'manuel_tomasello@yahoo.it', '$2b$10$y.dA56./BiRX7khq8o.zceokwBhtduRod9d.jL9G5tpQHxCDFyKSG', 100.00, 'admin', 'MTOMASELLO', 1),
(18743, 85475, 'marco ', 'toma', 'toma.marco3@studio.unibo.it', '$2b$10$QbxRdRVEcOXjU.wpEKrpXO1nM5kTV0e1h6PA81W1lwuh3G.gVWQgm', 150.00, 'admin', 'toma', 1),
(18745, 4983, 'ajeje', 'brazorf', 'ajeje.brazorf@hotmail.it', '$2b$10$LDYpe3iPdJwQXpAGsZnRZe62FDHb2V8FI22J4wu/4baQztiElCgpO', 225.00, 'user', 'brazorf', 1),
(18746, 78123, 'Giuseppe', 'Verdi', 'giuseppe.verdi@example.com', '$2b$10$WwynsFmd6HPayk1VFInrbODRsyUNrJ74ixnIQzBGDklZGvsRpuBI.', 25.50, 'user', 'gverdi', 1),
(18747, 18278, 'Giuseppe', 'Ciriolo', 'giuseppe.ciriolo@salami.it', '$2b$10$nvpbsB8iGfeoD3llQN2qUObu7LtM/kez/llflwIHnxVbPSuk73VMS', 200.00, 'admin', 'CIRIOLO', 1),
(18749, 18279, 'Giuseppe', 'Ciriolo', 'giuseppe.ciriolo@salami.it', '$2b$10$dNqzTqMQaowdxy30.CdO4eDZJPhUPP9RPo0xDjAWWd6m6I1wtup8m', 200.00, 'admin', 'CIRIOLS', 1),
(18751, 98763, 'prova', 'provino', 'luigi.bianchi@example.com', '$2b$10$NvNj2w2cLf.rnFMcipTHDekuPU/BLcfYVJ2f5zi3nw4tj4VsNq3g2', 22.50, 'user', 'prova', 1),
(18752, 98123, 'sabatino', 'sabato', NULL, '$2b$10$lvCCRzGsqiLGB1zYj7jZuuGUpOFJAT3Z1dbNUCYq8.0aExtEGv.Nu', 50.00, 'user', 'sabato', 1),
(18753, 45321, 'aaa', 'aaa', NULL, '$2b$10$tbXk1m0KW5bDQdhMd.wHW.q7u9vPmoj4S3ziNq5vNIdWW3Ws3hKaS', 20.00, 'admin', 'aaa', 1),
(18754, 8888, 'bbb', 'bbb', NULL, '$2b$10$qW.LO4MMIC2xijAqb6RIduCl7To.ox6Ei2s6ufMAujvkJZ8zJrHGO', 8.00, 'admin', 'bbb', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `risorsa`
--

CREATE TABLE `risorsa` (
  `NomeRisorsa` int(11) NOT NULL,
  `ModMacc` varchar(100) NOT NULL,
  `DescMacc` text DEFAULT NULL,
  `CostoOrarioFermo` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `risorsa`
--

INSERT INTO `risorsa` (`NomeRisorsa`, `ModMacc`, `DescMacc`, `CostoOrarioFermo`) VALUES
(0, 'statistica', 'statistica', 0.00),
(2, 'Pressa Idraulica', 'Pressa per stampaggio industriale', 200.00),
(147, 'Taglio Laser', 'lavora i corpi dei distributori', 100.00),
(456, 'lavatrice Fori', 'Nuova lavatrice, spana i fori dei distributori', 80.00),
(465, 'provoletta', 'provina', 200.00),
(466, 'Mandelli', 'Macchina cnc', 200.00),
(568, 'Tornio a 5 assi', 'Tornio computerizzato ad alta precisione', 270.00),
(598, 'Smerigliatrice a 5 assi', ' ad alta precisione', 270.00),
(678, 'levigatrice', 'vecchia levigatrice', 76.00),
(753, 'Wele', 'Lavorazione CNC distributori', 80.00),
(789, 'lavatrice', 'pulisce fori', 100.00),
(852, 'Macchina CNC', 'lavorazione monoblocco', 1000.00),
(872, 'Braccio Meccanico ad ultra precisione', 'Comprata a maggio 25', 3500.00),
(912, 'rettifica', 'rettifica spole', 100.00),
(925, 'Macchina per Motori', 'dai 200 a 350 cc', 1700.00),
(951, 'Tornio Puma Doosan 2100sy', 'tornio xyz', 200.00);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `articoli_consumabili`
--
ALTER TABLE `articoli_consumabili`
  ADD PRIMARY KEY (`Articolo`);

--
-- Indici per le tabelle `cause_guasto`
--
ALTER TABLE `cause_guasto`
  ADD PRIMARY KEY (`IdGuasto`);

--
-- Indici per le tabelle `fatture`
--
ALTER TABLE `fatture`
  ADD PRIMARY KEY (`NFatt`),
  ADD KEY `IntId` (`IntId`);

--
-- Indici per le tabelle `fornitore`
--
ALTER TABLE `fornitore`
  ADD PRIMARY KEY (`IdFornitore`);

--
-- Indici per le tabelle `interventi`
--
ALTER TABLE `interventi`
  ADD PRIMARY KEY (`IntId`),
  ADD KEY `ManId` (`ManId`),
  ADD KEY `TipoGuastoId` (`TipoGuastoId`),
  ADD KEY `fk_interventi_risorsa` (`NomeRisorsaInt`);

--
-- Indici per le tabelle `interventi_articoli`
--
ALTER TABLE `interventi_articoli`
  ADD PRIMARY KEY (`IntId`,`ArtId`),
  ADD KEY `ArtId` (`ArtId`);

--
-- Indici per le tabelle `interventi_dipendenti`
--
ALTER TABLE `interventi_dipendenti`
  ADD PRIMARY KEY (`IntId`,`IdDip`),
  ADD KEY `IdDip` (`IdDip`);

--
-- Indici per le tabelle `interventi_esterni`
--
ALTER TABLE `interventi_esterni`
  ADD PRIMARY KEY (`IntId`,`IdFornitore`),
  ADD KEY `IdFornitore` (`IdFornitore`);

--
-- Indici per le tabelle `manutenzioni`
--
ALTER TABLE `manutenzioni`
  ADD PRIMARY KEY (`ManId`),
  ADD KEY `MaccIdMan` (`MaccIdMan`);

--
-- Indici per le tabelle `operatore`
--
ALTER TABLE `operatore`
  ADD PRIMARY KEY (`IdDip`) USING BTREE,
  ADD UNIQUE KEY `username` (`username`);

--
-- Indici per le tabelle `risorsa`
--
ALTER TABLE `risorsa`
  ADD PRIMARY KEY (`NomeRisorsa`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `articoli_consumabili`
--
ALTER TABLE `articoli_consumabili`
  MODIFY `Articolo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT per la tabella `cause_guasto`
--
ALTER TABLE `cause_guasto`
  MODIFY `IdGuasto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT per la tabella `manutenzioni`
--
ALTER TABLE `manutenzioni`
  MODIFY `ManId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT per la tabella `operatore`
--
ALTER TABLE `operatore`
  MODIFY `IdDip` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18755;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `fatture`
--
ALTER TABLE `fatture`
  ADD CONSTRAINT `fatture_ibfk_1` FOREIGN KEY (`IntId`) REFERENCES `interventi` (`IntId`);

--
-- Limiti per la tabella `interventi`
--
ALTER TABLE `interventi`
  ADD CONSTRAINT `fk_interventi_risorsa` FOREIGN KEY (`NomeRisorsaInt`) REFERENCES `risorsa` (`NomeRisorsa`),
  ADD CONSTRAINT `interventi_ibfk_1` FOREIGN KEY (`ManId`) REFERENCES `manutenzioni` (`ManId`),
  ADD CONSTRAINT `interventi_ibfk_2` FOREIGN KEY (`TipoGuastoId`) REFERENCES `cause_guasto` (`IdGuasto`);

--
-- Limiti per la tabella `interventi_articoli`
--
ALTER TABLE `interventi_articoli`
  ADD CONSTRAINT `interventi_articoli_ibfk_1` FOREIGN KEY (`IntId`) REFERENCES `interventi` (`IntId`),
  ADD CONSTRAINT `interventi_articoli_ibfk_2` FOREIGN KEY (`ArtId`) REFERENCES `articoli_consumabili` (`Articolo`);

--
-- Limiti per la tabella `interventi_dipendenti`
--
ALTER TABLE `interventi_dipendenti`
  ADD CONSTRAINT `interventi_dipendenti_ibfk_1` FOREIGN KEY (`IntId`) REFERENCES `interventi` (`IntId`),
  ADD CONSTRAINT `interventi_dipendenti_ibfk_2` FOREIGN KEY (`IdDip`) REFERENCES `operatore` (`IdDip`);

--
-- Limiti per la tabella `interventi_esterni`
--
ALTER TABLE `interventi_esterni`
  ADD CONSTRAINT `interventi_esterni_ibfk_1` FOREIGN KEY (`IntId`) REFERENCES `interventi` (`IntId`),
  ADD CONSTRAINT `interventi_esterni_ibfk_2` FOREIGN KEY (`IdFornitore`) REFERENCES `fornitore` (`IdFornitore`);

--
-- Limiti per la tabella `manutenzioni`
--
ALTER TABLE `manutenzioni`
  ADD CONSTRAINT `manutenzioni_ibfk_1` FOREIGN KEY (`MaccIdMan`) REFERENCES `risorsa` (`NomeRisorsa`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
