import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { checkCompliance } from './services/complianceService';

const app = express();
const port = 3000;

app.use(express.json());

const complianceHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { testUrl } = req.body;

    if (!testUrl) {
        res.status(400).json({ message: 'testUrl is required' });
        return;
    }

    try {
        const findings = await checkCompliance(testUrl);

        res.json(findings);
    } catch (error: any) {
        next(error);
    }
};

app.post('/check-compliance', complianceHandler);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err); // Log the error (you can replace this with a logger)
    res.status(500).json({ message: 'Error checking compliance', error: err.message || 'Unknown error' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
