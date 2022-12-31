const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => {
  res.sendFile(__dirname+"/index.html")
});

app.get('/styles', (req, res) =>{
  res.sendFile(__dirname+"/style.css")
})

app.get('/script', (req, res) =>{
  res.sendFile(__dirname+"/script.js")
})

app.listen(3000, () => {
  console.log('Сервер запущен');
});

app.get('/fandom',(req,res)=>{
  res.sendFile(__dirname+"/fandom.html")
})

app.get('/fandompages',(req,res)=>{
  res.sendFile(__dirname+"/fandompages.json")
})

app.get("/Ugolekimg",(req,res)=>{
  res.sendFile(__dirname+"/img/Уголёк.png")
})

app.get("/developers",(req,res)=>{
  res.sendFile(__dirname+"/developers.html")
})