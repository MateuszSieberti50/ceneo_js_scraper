
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const URLS = [
  "https://www.ceneo.pl/28726030",
  "https://www.ceneo.pl/96145654"
];

async function fetchPage(url){
  try{
    const res = await axios.get(url,{headers:{"User-Agent":"Mozilla/5.0"},timeout:15000});
    return res.data;
  }catch(e){
    console.error("[ERROR]",url,e.message);
    return null;
  }
}

function extractPrice($){
  const selectors=['[itemprop="price"]','.product-top__price','.price','.value'];
  for(const s of selectors){
    const t=$(s).first().text().trim();
    if(t && /\d/.test(t)) return t;
  }
  return "nie znaleziono";
}

function parseProduct(html,url){
  if(!html) return {status:"ERROR",url};
  const $=cheerio.load(html);
  return {
    status:"OK",
    url,
    title:$("h1").first().text().trim() || "brak",
    price:extractPrice($),
    scrapedAt:new Date().toISOString()
  };
}

(async()=>{
 const pages=await Promise.all(URLS.map(fetchPage));
 const results=pages.map((p,i)=>parseProduct(p,URLS[i]));
 console.table(results);
 fs.writeFileSync("results.json",JSON.stringify(results,null,2));
})();
