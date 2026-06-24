// PRODUCTION AMBIENT - AI AGENT CONTROLLER
// This API is required by the Agent

import { Request, Response } from 'express';
import { connection } from '../utils/db';

export async function createInterventoAI(req: Request, res: Response) {

    const {
        ManId, NomeRisorsaInt, DataIntPrev, DataIntEff, TmpInt, EsitoMan, noteIntervento, TipoGuastoId,
        Dipendenti, FornitoriEsterni, ArticoliUsati,
    } = req.body;
    const conn = await connection.promise().getConnection();

    try {
        const year = new Date().getFullYear().toString().slice(-2);

        // SQL Server: TOP 1 al posto di LIMIT 1
        const [lastIdResult] = await conn.query(
            'SELECT TOP 1 IntId FROM interventi WHERE IntId LIKE ? ORDER BY IntId DESC',
            [`INT-${year}-%`]
        );

        let newProgressivo = '00001';
        if ((lastIdResult as any[]).length > 0) {
            const lastId = (lastIdResult as any)[0].IntId;
            const lastNumber = parseInt(lastId.split('-')[2], 10);
            newProgressivo = (lastNumber + 1).toString().padStart(5, '0');
        }

        const newIntId = `INT-${year}-${newProgressivo}`;

        await conn.execute(
            `INSERT INTO interventi (
                IntId, ManId, NomeRisorsaInt, DataIntPrev, DataIntEff, OraInizio, OraFine, TmpInt,
                EsitoMan, noteIntervento, TipoGuastoId, OriginInt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newIntId,
                ManId,
                NomeRisorsaInt,
                DataIntPrev,
                DataIntEff || null,
                '08:00:00', // Orario di default
                '12:00:00', // Orario di default
                TmpInt || null,
                EsitoMan ? 1 : 0,
                noteIntervento || null,
                TipoGuastoId || null,
                2 // OriginInt: 2 indica intervento creato dall'AI
            ]
        );

        if (Dipendenti?.length > 0) {
            const dipendentiValues = Dipendenti.map((dipId: number) => [newIntId, dipId]);
            await conn.query(
                'INSERT INTO interventi_dipendenti (IntId, IdDip) VALUES ?',
                [dipendentiValues]
            );
        }

        if (FornitoriEsterni?.length > 0) {
            const fornitoriValues = FornitoriEsterni.map((fornId: string) => [newIntId, fornId]);
            await conn.query(
                'INSERT INTO interventi_esterni (IntId, IdFornitore) VALUES ?',
                [fornitoriValues]
            );
        }

        if (ArticoliUsati?.length > 0) {
            const articoliValues = ArticoliUsati.map(
                (articolo: { ArtId: number, qta: number }) => [newIntId, articolo.ArtId, articolo.qta]
            );
            await conn.query(
                'INSERT INTO interventi_articoli (IntId, ArtId, qta) VALUES ?',
                [articoliValues]
            );
        }

        res.status(201).json({
            message: 'Intervento creato con successo',
            IntId: newIntId,
        });

    } catch (error: any) {
        console.error('Errore durante la creazione intervento:', error);
        res.status(500).json({
            message: 'Errore nel processo di creazione',
            error: error.message,
            details: error.originalError?.info?.message ?? error.message,
        });
    } finally {
        conn.release();
    }
}
