const assert=require('assert');
const balances={amort:422.67*4-.10,renta:164.05*4,tributos:130.16*3-240.48,boda:50*3,cesped:35*2,agua:67*2-132.90,seguro:50*2};
const total=Object.values(balances).reduce((a,b)=>a+b,0);assert(Math.abs(total-2817.88)<0.005,total);console.log('PASS huchas canonical total',total.toFixed(2),balances);
