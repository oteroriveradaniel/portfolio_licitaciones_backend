import express, { type Express, type Request, type Response } from 'express';
import { MongoClient, ServerApiVersion, type Db, type Collection } from 'mongodb';

const app: Express = express();
const port = 3000;

class Contrato {
  id: String;
  title: String;
  valueAmount: number;

  constructor(id: String, title: String, valueAmount: number) {
    this.id = id;
    this.title = title;
    this.valueAmount = valueAmount;
  }
}

app.get('/', async (req: Request, res: Response) => {
   const uri = 'mongodb+srv://oteroriveradaniel_db_user:2M09afAXCEgq4Edo@prod.16s6pfd.mongodb.net/';
   const contratos: Contrato[] = [];

   const client = new MongoClient(uri, {
      serverApi: {
         version: ServerApiVersion.v1,
         strict: true,
         deprecationErrors: true,
      },
   });

   const database: Db = client.db('licitaciones');
   const collection: Collection = database.collection('contratos');

   const projectFields = { _id: 0, identifier: 1, valueAmount: 1 };

   for await (const item of collection.find().project(projectFields).skip(0).limit(50)) {
      const contrato: Contrato = new Contrato(item["identifier"], item["title"], item["valueAmount"]);
      contratos.push(contrato);
   }

   res.send(contratos.sort((a, b) => a.valueAmount - b.valueAmount));
});

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`);
});