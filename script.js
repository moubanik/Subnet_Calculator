function ipToInt(ip){return ip.split('.').reduce((a,o)=>(a<<8)+parseInt(o),0)>>>0;}
function intToIp(int){return[(int>>>24),(int>>16&255),(int>>8&255),(int&255)].join('.');}

function cidrToMask(cidr){let mask=(~0<<(32-cidr))>>>0;return intToIp(mask);}

function showRange(){
 const c=document.getElementById('ipClass').value;
 const r=c==='A'?"1.0.0.0 - 126.255.255.255":c==='B'?"128.0.0.0 - 191.255.255.255":"192.0.0.0 - 223.255.255.255";
 document.getElementById('range').innerHTML="Range: "+r;
}

function toggleVLSM(){
 document.getElementById('hosts').style.display = document.getElementById('mode').value==='vlsm'?'block':'none';
}

function detectClass(ip){
 let f=parseInt(ip.split('.')[0]);
 if(f>=1&&f<=126)return'A';
 if(f>=128&&f<=191)return'B';
 if(f>=192&&f<=223)return'C';
 return'Invalid';
}

function calculate(){
 const mode=document.getElementById('mode').value;
 const ipClass=document.getElementById('ipClass').value;
 const ip=document.getElementById('ip').value;
 const cidr=parseInt(document.getElementById('cidr').value);
 const output=document.getElementById('output');

 if(!ip){output.innerHTML="Enter valid input";return;}
 if(detectClass(ip)!==ipClass){output.innerHTML="❌ Class mismatch";return;}

 if(mode==='flsm') calculateFLSM(ip,cidr);
 else calculateVLSM(ip);
}

// -------- FLSM --------
function calculateFLSM(ip,cidr){
 if(isNaN(cidr)){document.getElementById('output').innerHTML="Enter CIDR";return;}

 const ipInt=ipToInt(ip);
 const classDefault = cidr<=8?8:cidr<=16?16:24;
 const subnetBits = cidr - classDefault;
 const networks = Math.pow(2, subnetBits);
 const hosts = Math.pow(2,(32-cidr))-2;
 const blockSize = Math.pow(2,(32-cidr));
 const mask = cidrToMask(cidr);

 let start = ipInt & ((~0<<(32-cidr))>>>0);
 let result = `
 <b>Mode:</b> FLSM<br>
 <b>Subnet Mask:</b> ${mask}<br>
 <b>No. of Networks:</b> ${networks}<br>
 <b>Hosts per Network:</b> ${hosts}<br>
 <b>Block Size:</b> ${blockSize}<br><br>
 <b>All Subnets:</b><br>
 `;

 for(let i=0;i<networks;i++){
   let net = start + (i*blockSize);
   let broad = net + blockSize -1;
   let first = net+1;
   let last = broad-1;

   result += `<div style="margin-bottom:10px;padding:8px;background:#111827;border-radius:6px;">
   <b>Network:</b> ${intToIp(net)}<br>
   <b>First Host:</b> ${intToIp(first)}<br>
   <b>Last Host:</b> ${intToIp(last)}<br>
   <b>Broadcast:</b> ${intToIp(broad)}
</div>`;
 }

 document.getElementById('output').innerHTML=result;
}

// -------- VLSM --------
function calculateVLSM(baseIp){
 const hostsInput=document.getElementById('hosts').value;
 if(!hostsInput){document.getElementById('output').innerHTML="Enter host values";return;}

 let hosts=hostsInput.split(',').map(x=>parseInt(x)).sort((a,b)=>b-a);
 let currentIp=ipToInt(baseIp);
 let result=`<b>Mode:</b> VLSM<br><br>`;

 hosts.forEach(h=>{
   let needed=h+2;
   let power=Math.ceil(Math.log2(needed));
   let blockSize=Math.pow(2,power);
   let cidr=32-power;

   let net=currentIp;
   let broad=currentIp+blockSize-1;
   let first=net+1;
   let last=broad-1;

   result += `<div style="margin-bottom:12px;padding:10px;background:#111827;border-radius:6px;">
   <b>Hosts Needed:</b> ${h}<br>
   <b>Subnet Mask:</b> ${cidrToMask(cidr)} (/${cidr})<br>
   <b>Block Size:</b> ${blockSize}<br>
   <b>Network:</b> ${intToIp(net)}<br>
   <b>First Host:</b> ${intToIp(first)}<br>
   <b>Last Host:</b> ${intToIp(last)}<br>
   <b>Broadcast:</b> ${intToIp(broad)}
</div>`;;

   currentIp=broad+1;
 });

 document.getElementById('output').innerHTML=result;
}

function resetAll(){
 document.getElementById('ip').value="";
 document.getElementById('cidr').value="";
 document.getElementById('hosts').value="";
 document.getElementById('output').innerHTML="";
 document.getElementById('mode').value="flsm";
 document.getElementById('ipClass').value="A";
 toggleVLSM();
 showRange();
}

function toggleFormula(btn){
  const box = document.getElementById('formulaBox');

  if(box.style.display === "none"){
    box.style.display = "block";
    btn.innerText = "Hide Formulas";
  } else {
    box.style.display = "none";
    btn.innerText = "Show Formulas";
  }
}

showRange();