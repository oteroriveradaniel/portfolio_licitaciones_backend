import express, { type Express, type Request, type Response } from 'express';
import { MongoClient, ServerApiVersion, type Db, type Collection } from 'mongodb';
import dotenv from 'dotenv';
import { Contrato } from './Contrato';

const app: Express = express();
const PORT = 3000;

dotenv.config();

app.get('/cuenta-licitaciones', async (req: Request, res: Response) => {
   const uri: string = process.env.MONGODB_URI ?? "";
   const contratos: Contrato[] = [];

   const client = new MongoClient(uri, {
      serverApi: {
         version: ServerApiVersion.v1,
         strict: true,
         deprecationErrors: true,
      },
   });

   const { results, category, search, minAmount, maxAmount, minDate, maxDate } = req.query;

   const filtros = {
    results: results || 'perfil', 
    category: category?.toString() || '',
    search: search || '',
    minAmount: minAmount ? Number(minAmount) : 0,
    maxAmount: maxAmount ? Number(maxAmount) : 1000000,
    minDate: minDate ? new Date(minDate.toString()) : null,
    maxDate: maxDate ? new Date(maxDate.toString()) : null
  };

   const query: Record<string, any>  = {
      valueAmount: { $gte: filtros.minAmount, $lte: filtros.maxAmount },
      tenderSubmissionDeadline: { $gte: filtros.minDate, $lte: filtros.maxDate },
   };

   if (filtros.category) {
      query[filtros.category] = { $regex: filtros.search, $options: "i" };
   }

   const database: Db = client.db("licitaciones");
   const collection: Collection = database.collection('contratos');

   const pipeline = [
   {
      $match: query, 
   },
   {
      $group: {
         _id: null, 
         cuenta: { $sum: 1 },
         mediana: {
            $median: {
              input: '$valueAmount', 
              method: 'approximate', 
            }
          }
      }
   }
   ];

   const resultado = await collection.aggregate(pipeline).toArray();
   
   const metricas = resultado.length > 0 
      ? resultado[0] 
      : { cuenta: 0, mediana: 0 };

   res.send(metricas);
});

app.get('/', async (req: Request, res: Response) => {
   const uri: string = process.env.MONGODB_URI ?? "";
   const contratos: Contrato[] = [];

   const client = new MongoClient(uri, {
      serverApi: {
         version: ServerApiVersion.v1,
         strict: true,
         deprecationErrors: true,
      },
   });

   const { results, category, search, minAmount, maxAmount, minDate, maxDate } = req.query;

   const filtros = {
    results: results || 'perfil', 
    category: category?.toString() || '',
    search: search || '',
    minAmount: minAmount ? Number(minAmount) : 0,
    maxAmount: maxAmount ? Number(maxAmount) : 1000000,
    minDate: minDate ? new Date(minDate.toString()) : null,
    maxDate: maxDate ? new Date(maxDate.toString()) : null
  };

   const query: Record<string, any>  = {
      valueAmount: { $gte: filtros.minAmount, $lte: filtros.maxAmount },
      tenderSubmissionDeadline: { $gte: filtros.minDate, $lte: filtros.maxDate },
   };

   if (filtros.category) {
      query[filtros.category] = { $regex: filtros.search, $options: "i" };
   }

   // TODO: Add pagination.

   const database: Db = client.db("licitaciones");
   const collection: Collection = database.collection('contratos');

   const projectFields = { _id: 0, identifier: 1, valueAmount: 1 };

   for await (const item of collection.find(query).project(projectFields).skip(0).limit(50)) {
      const contrato: Contrato = new Contrato(item["identifier"], item["title"], item["valueAmount"]);
      contratos.push(contrato);
   }

   console.log(query);

   res.send(contratos.sort((a, b) => a.valueAmount - b.valueAmount));
});

app.listen(PORT, () => {
   console.log(`Example app listening on port ${PORT}`);
});