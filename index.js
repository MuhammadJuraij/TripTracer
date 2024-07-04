import express from "express";
import bodyParser from "body-parser";
import pg from 'pg'
const db=new pg.Client({
  user:'postgres',
  host:'localhost',
  database:'world',
  password:'00000',
  port:5432
})
const app = express();
const port = 3000;

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function visitedcontries(){
  let result =await db.query('select country_code from visited_countries')
  let countries=[];
  result.rows.forEach(country=>{
  countries.push(country.country_code)
  })
  return countries;
}


app.get("/", async (req, res) => {
  //Write your code here.
  let countries=await visitedcontries();
  console.log(countries)
  res.render('index.ejs',{countries:countries,total:countries.length})
});


app.post('/add',async(req,res)=>{
  let input=req.body.country
  console.log(input)
 
  try{
    let result=await db.query("select country_code from countries where lower(country_name)like'%' || $1 || '%';",[input.toLowerCase()] )
    // console.log(result.rows)

   
      let data=result.rows[0]
      console.log(data)
      let countrycode=data.country_code
      console.log(countrycode)
      
      try{
        await db.query('insert into visited_countries  (country_code) values ($1)',[countrycode])
        res.redirect('/')
      }
      catch(error){
        console.log(error)
        let countries=await visitedcontries()
        res.render('index.ejs',{countries:countries,total:countries.length,error:"the country already exist"})
      }

  }
  catch(error){
    console.log(error)
    let countries=await visitedcontries()
    res.render('index.ejs',{countries:countries,total:countries.length,error:"the country doesnt exist"})
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
