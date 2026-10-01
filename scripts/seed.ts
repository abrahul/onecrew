import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const rows: [string,string][] = [
  ['Home Services','House Cleaning'],['Home Services','Deep Cleaning'],['Home Services','Gardening & Yard Work'],['Home Services','House Shifting Assistance'],['Home Services','Furniture Moving'],
  ['Daily Labour','General Helpers'],['Daily Labour','Loading & Unloading Workers'],['Daily Labour','Construction Helpers'],['Daily Labour','Mason Helpers'],['Daily Labour','Painting Helpers'],
  ['Skilled Workforce','Electricians'],['Skilled Workforce','Plumbers'],['Skilled Workforce','Carpenters'],['Skilled Workforce','AC Technicians'],['Skilled Workforce','Welders'],
  ['Business Support','Office Assistants'],['Business Support','Warehouse Workers'],['Business Support','Event Staff'],['Business Support','Delivery Helpers'],['Business Support','Temporary Workforce'],
];
async function main(){for(const [category,name] of rows)await db.service.upsert({where:{name},update:{category,active:true},create:{category,name}});console.log(`Seeded ${rows.length} ONECREW services.`);}
main().finally(()=>db.$disconnect());
