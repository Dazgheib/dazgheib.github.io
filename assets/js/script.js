//----//

const h2b = (h) => {
  return Uint8Array.from(h.match(/.{1,2}/g).map((b)=>parseInt(b,16)));
}
const b2h = (b) => {
  return b.reduce((str,byte)=>str+byte.toString(16).padStart(2,"0"),"");
}

const b642h = (b64) => {
  const w = atob(b64);
  let r = "";
  for (let i=0;i<w.length;i++) {
    const h = w.charCodeAt(i).toString(16);
    r += (h.length===2?h:"0"+h);
  }
  return r;
}

const date2str1 = (n) => {
  return new Date(n*1000).toLocaleString();
}

const date2str2 = (n) => {
  return new Date(n*1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

const date2str3 = (n) => {
  const t = new Date(n*1000);
  return `${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()}`;
}

const sign = async (event,sk) => {
  const { schnorr } = nobleSecp256k1;
  const sha256 = bitcoinjs.crypto.sha256;
  const data = JSON.stringify([
    0,
    event["pubkey"],
    event["created_at"],
    event["kind"],
    event["tags"],
    event["content"]
  ]);
  event.id = sha256(data).toString("hex");
  event.sig = await schnorr.sign(event.id,sk);
  return event;
}
const encrypt = (sk,pk,text) => {
  const key = nobleSecp256k1.getSharedSecret(sk,"02"+pk,true).substring(2);
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const cipher = browserifyCipher.createCipheriv("aes-256-cbc",h2b(key), iv);
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(text);
  const emsg = buffer.Buffer.concat([cipher.update(encodedText),cipher.final()]).toString('base64');
  return emsg + "?iv="+btoa(String.fromCharCode.apply(null,iv));
}
const decrypt = (sk,pk,text) => {
  const [emsg,iv] = text.split("?iv=");
  const key = nobleSecp256k1.getSharedSecret(sk,"02"+pk,true).substring(2);
  const decipher = browserifyCipher.createDecipheriv("aes-256-cbc",h2b(key),h2b(b642h(iv)));
  const decrypted = buffer.Buffer.concat([decipher.update(buffer.Buffer.from(emsg,"base64")),decipher.final()]);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

const getPublicFromTags = (tags) => {
  for (let i=0;i<tags.length;i++) {
    if (tags[i][0]==="p") {
      return tags[i][1];
    }
  }
  return "";
}

//----//

const fallback_copy_text = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch(err) {}
}
const copy_text = (text) => {
  if (!navigator.clipboard) {
    fallback_copy_text(text);
    return;
  }
  navigator.clipboard.writeText(text)//.then(()=>{},(err)=>{});
}

message_input.addEventListener("input",() => {
  message_footer.style.height = "0";
  message_footer.style.height = message_input.scrollHeight*1.75+4+"px";
});
message_footer.style.height = "0";
message_footer.style.height = message_input.scrollHeight*1.75+4+"px";

send_message.onclick = () => {
  if (message_input.value.trim().length>0) {
    if (kind0s[user.pk]) {
      fix = "";
    } else {
      fix = user.name+"\n";
    }
    send_msg(chat_pk,fix+message_input.value.trim());
    message_input.value = "";
    messages_div.scrollTop = messages_div.scrollHeight;
    message_footer.style.height = "0";
    message_footer.style.height = message_input.scrollHeight*1.75 - 8 + "px";
  }
}

//----//
const chat_pk = "13b2f952d3f0eefe01214113ac47def4ded519678a3ddd086d66a6e64ff2332a";
const msg_limit = 64;
const user = JSON.parse(localStorage.getItem("user"))||{};
const kind0s = {
  "13b2f952d3f0eefe01214113ac47def4ded519678a3ddd086d66a6e64ff2332a" : `{
    "name":"دضغیب",
    "about":"",
    "picture":"",
    "icon":"3"
  }`
};
let messages = [];
let socket;
connected = false;

const load_elements_fix = () => {
  message_footer.style.display = "flex";
  sk_input.style.display = "none";
  sk_set.style.display = "none";
  sk_anon.style.display = "none";
  btn_logout.style.display = "block";
  user_info.innerText = "وارد شده به عنوان "+(JSON.parse(kind0s[user.pk]).name||(user.pk.substr(0,4)+".."+user.pk.substr(-4)+" ("+user.name+")"))
}

const disload_elements_fix = () => {
  message_footer.style.display = "none";
  sk_input.style.display = "block";
  sk_set.style.display = "block";
  sk_anon.style.display = "block";
  btn_logout.style.display = "none";
  user_info.innerText = "";
}

sk_input.addEventListener("focus",() => {
  sk_input.type = "text";
});

sk_input.addEventListener("blur",() => {
  sk_input.type = "password";
});

sk_set.onclick = () => {
  if (sk_input.value.trim().length<1) {
    alert("Invalid key!");
    return;
  }
  try {
    const keypair = bitcoinjs.ECPair.fromPrivateKey(buffer.Buffer.from(sk_input.value,"hex"));
    user.sk = sk_input.value;
    user.pk = keypair.publicKey.toString("hex").substring(2);
    localStorage.setItem("user",JSON.stringify(user));
    load_elements_fix();
  } catch(err) {
    alert("Invalid key!");
    return;
  }
}

sk_anon.onclick = () => {
  try {
    const name = prompt("اسم؟");
    if (name.trim().length>=3) {
      const keypair = bitcoinjs.ECPair.makeRandom();
      user.sk = keypair.privateKey.toString("hex");
      user.pk = keypair.publicKey.toString("hex").substring(2);
      user.name = name;
      localStorage.setItem("user",JSON.stringify(user));
      load_elements_fix();
    } else {
      alert("اسم درست");
    }
  } catch(err) {
    alert("Error");
    return;
  }
}

btn_logout.onclick = () => {
  if (confirm("Are you sure you want to log out?")) {
    delete user.sk;
    delete user.pk;
    delete user.name;
    localStorage.setItem("user",JSON.stringify(user));
    disload_elements_fix();
    load_messages();
  }
}

function get_times(n) {
  const t = new Date();
  const t1 = new Date(t);
  t1.setHours(0,0,0,0);
  t1.setDate(t.getDate()-n);
  const t2 = new Date(t);
  t2.setHours(0,0,0,0);
  t2.setDate(t.getDate()-n-1);
  return [t1.getTime()/1000,t2.getTime()/1000];
}

const close = (id) => {
  if (!socket) return;
  socket.send(JSON.stringify(["CLOSE",id]));
}

const get_msgs = () => {
  if (!socket) return;
  const filter = { "kinds":[999],"#p":[chat_pk],"limit":msg_limit,"since": 1741518167 };
  socket.send(JSON.stringify(["REQ","msgs",filter]));
}

const send_msg = async (pk,text) => {
  if (!socket) return;
  const encrypted = encrypt(chat_pk,pk,text);
  const event = {
    "content": encrypted,
    "created_at": Math.floor(Date.now()/1000),
    "kind": 999,
    "tags": [["p",pk]],
    "pubkey": user.pk
  };
  const signed = await sign(event,user.sk);
  socket.send(JSON.stringify(["EVENT",signed]));
}

const delete_msg = async (id) => {
  if (confirm("Are you sure you want to delete this?")) {
    if (!socket) return;
    const event = {
      "content": "",
      "created_at": Math.floor(Date.now()/1000),
      "kind": 999,
      "tags": [["e",id]],
      "pubkey": user.pk
    };
    const signed = await sign(event,user.sk);
    socket.send(JSON.stringify(["EVENT",signed]));
    const index = messages.findIndex(message=>message.id==id);
    if (index!==-1) {
      messages.splice(index,1);
    }
    load_messages();
  }
}

const load_messages = () => {
  messages = messages.sort((a,b)=>(a.created_at>b.created_at)?1:-1);
  if (messages.length>msg_limit) {
    messages.splice(0,messages.length-msg_limit);
  }
  messages_div.innerHTML = "";

  for (let i=0;i<messages.length;i++) {
    const message = document.createElement("div");
    message.classList.add("message");
    if (messages[i].pubkey==user.pk) {
      message.classList.add("right");
    } else {
      message.classList.add("left");
    }

    let content = messages[i].content;

    const name = document.createElement("div");
    name.classList.add("name");
    name.innerText = (messages[i].pubkey==user.pk?"You":messages[i].pubkey);
    if (kind0s[messages[i].pubkey]) {
      const data = JSON.parse(kind0s[messages[i].pubkey]);
      const icon = ""||"<div class=\"name_icon\" style=\"background-image:url('./img/icons/"+data.icon+".png')\">";
      name.innerText = (data.name||(messages[i].pubkey==user.pk?"You":messages[i].pubkey));
      name.innerHTML += icon
    } else {
      //const str = messages[i].content;
      //const index = str.indexOf("\n");
      //const name0 = str.slice(0,index);
      //content = str.slice(index+1);
      const [name0,content0] = messages[i].content.split(/\n(.*)/);
      content = content0;
      name.innerText = name0;
    }
    message.appendChild(name);

    /*if (messages[i].pubkey==user.pk) {
      const delete_div = document.createElement("div");
      delete_div.classList.add("delete");
      delete_div.setAttribute("onclick",`delete_msg("${messages[i].id}")`);
      const delete_img = document.createElement("img");
      delete_img.setAttribute("draggable","false");
      delete_img.src = "./svg/close.svg";
      delete_div.appendChild(delete_img);
      message.appendChild(delete_div);
    }*/

    const text = document.createElement("div");
    text.classList.add("text");
    text.classList.add("selectable");
    text.innerText = content;
    message.appendChild(text);

    const time = document.createElement("div");
    time.classList.add("time");
    time.innerText = date2str2(messages[i].created_at);
    message.appendChild(time);

    messages_div.appendChild(message);
  }
}

const connect = () => {
  if (socket) socket.close();
  socket = new WebSocket("wss://nos.lol");

  socket.addEventListener("message", async (message) => {
    const [type,sub,event] = JSON.parse(message.data);
    if (!event) return;
    let { kind, content , tags , pubkey , created_at , id } = event || {};

    if (kind == 999) {

      try {
        content = await decrypt(chat_pk,chat_pk,content);
      } catch (err) {
        content = "Error";
      }
      messages.push({
        "content": content,
        "created_at": created_at,
        "pubkey": pubkey,
        "id": id
      });
      load_messages();
      if (pubkey==user.pk) messages_div.scrollTop = messages_div.scrollHeight;

    }
  });

  socket.addEventListener("close", async () => {
    console.log("Disconnected.");
    //document.body.innerHTML = "Disconnected.";
  });

  socket.addEventListener("open",() => {
    console.log("Connected.");
    get_msgs();
    setTimeout(()=>{
      messages_div.scrollTop = messages_div.scrollHeight;
    },500);
  });
}

connect();

if (user!={}) {
  try {
    const keypair = bitcoinjs.ECPair.fromPrivateKey(buffer.Buffer.from(user.sk,"hex"));
    load_elements_fix();
  } catch(err) {}
}
