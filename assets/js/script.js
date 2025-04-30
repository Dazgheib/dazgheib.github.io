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
  message_footer.style.height = message_input.scrollHeight*1.625+"px";
});
message_footer.style.height = "0";
message_footer.style.height = message_input.scrollHeight*1.625+"px";

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
const users = [
  {
    "name": "دضغیب",
    "path": "dazgheib:0:0:0",
    "pk": "1c575697ab02043dbbf09aa8ce13949705fefb9c5028ee06706c8b05d1ebfad4"
  },
  {
    "name": "دضغیب",
    "path": "dazgheib:0:0:0",
    "pk": chat_pk
  },
  {
    "name": "امیر محمد افشار",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:0",
    "pk": "5e7aaa31b55f3deafc8669a7d5e872b9c4be2a6992d80e0100107a9868be5e87"
  },
  {
    "name": "حسین امینی لاری",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:1",
    "pk": "900bdb6bc7fea3fa1803954cc4d1e8809ac111c7ad51c553aba02465f5c32c87"
  },
  {
    "name": "امیر عباس آزاد",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:2",
    "pk": "cadf686815e999bd76572dd4476227e3d41d9859b5c440676374ca1a11a35815"
  },
  {
    "name": "ماهان بازی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:3",
    "pk": "c5cd67d7ef264aadedd58e3fcba3f2f2822fab99e42376ad9190f11c33aeaa51"
  },
  {
    "name": "کیارش بوستانی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:4",
    "pk": "51b3dd42ea2d77dbac4cabd446de8167de1fb09710d14b37d72ffae769d27d45"
  },
  {
    "name": "پارسا حسینی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:5",
    "pk": "13fd969249114b077990e6f61f2099073c8735a70b7d6472e5d9df48ab9194ea"
  },
  {
    "name": "امیر محمد دهقانی قطب آبادی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:6",
    "pk": "3d6d6f1448e4faa162d9ac177e003ace98d74876ec490aec6956c2affc971fa5"
  },
  {
    "name": "کیان رحمان نیا",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:7",
    "pk": "4d87e3a170d986033ee797ec2d873f24ccbe04492a77ff873a1daf06ae65439f"
  },
  {
    "name": "امیررضا رحیمی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:8",
    "pk": "34402255e48586f8e0778da2cd6ee188535f0e02feccee90c1062ff247754656"
  },
  {
    "name": "محمد طاها رحیمی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:9",
    "pk": "33d7a321fe8a630e81b3682e95a471280d0f7a2283860463c3f290b818506708"
  },
  {
    "name": "امیر پویا رضایی حقیقی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:10",
    "pk": "0b09d894329b3ca65e06428a08f12d3af07aa3d72c806b348eefc33aa806f9e8"
  },
  {
    "name": "سید آرین رضوی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:11",
    "pk": "2d999d20799670adc244260bafb3db0b414480f26cf9210dc27f659a32291888"
  },
  {
    "name": "رضا روحانی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:12",
    "pk": "47795eba8386d2bcd920a1bfd43ff4f986a63644d8ad022d7eb0eea0a2c377e6"
  },
  {
    "name": "پارسا روشنائی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:13",
    "pk": "3a2c6a136ada88dfac465aa7ec3c394ad7a1d74c21acf7cbc06bbaa4513b9671"
  },
  {
    "name": "علیرضا سلطانی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:14",
    "pk": "c08767978facc362df7b72f600f33d82fc72334b0006a883e5bdb09cdd38e8bb"
  },
  {
    "name": "سروش سلیم حقیقی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:15",
    "pk": "a9ad9dcc76c65147659240fda6d9020a2ecf977b2e60c35344ca9087117292aa"
  },
  {
    "name": "امیر علی سیاران",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:16",
    "pk": "bc161fcc6ba15cc93822dcca1112bfc6af52acb0d2911fd82cffe851b6b7bbce"
  },
  {
    "name": "امیر حسین شکری",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:17",
    "pk": "900313637ec443e5484cd4f27c606ae42fc36d0f1e3b7750976fb345af25999b"
  },
  {
    "name": "شهرام صفرپور",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:18",
    "pk": "158d1ba7028529c3a0c62c7e6d462785de1fac7a11efb0e1635156580a4b4552"
  },
  {
    "name": "امیر محمد عابدی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:19",
    "pk": "d5a6de7912d8594d443d16967e8821bf6383e86454c3d185135af4d93764bdea"
  },
  {
    "name": "امیر رضا غریب",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:20",
    "pk": "04dd3113d31f09b8dcab80cc260d80d7b70355f908d6100d6c001579ef64025a"
  },
  {
    "name": "امیر ارسلان کوثری",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:21",
    "pk": "b01cf8a7d8225c73f35c97e2dc447fc14112d59593ed57d646ec0e395fb4b21c"
  },
  {
    "name": "امیر علی معتضدیان",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:22",
    "pk": "735d4eafd46b33781ce58b9514635dc6f00d2b152c31da6c8ff1ebdac23bd3d0"
  },
  {
    "name": "آرین مهبودی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:23",
    "pk": "b5d24a38d168c54dac648454926ccbeeb69483042f347892c39d22e81c0c6ad4"
  },
  {
    "name": "بهنیا نیاسان",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:24",
    "pk": "69cff2149401e306c00e1c4c97d6d6922ec3273ffc79cf0848856d7cc6c17216"
  },
  {
    "name": "علیرضا ارغوانی پیرسلامی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:0",
    "pk": "0556b00dba42fd0956de99d6791949b5912d96f658b994debca7beeec98e324b"
  },
  {
    "name": "آروین اسدسنگابی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:1",
    "pk": "32aec4ef8b2930a890c8e0b04dc750d486e027ec598e6462574f9f638af1fb99"
  },
  {
    "name": "علیرضا افخمی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:2",
    "pk": "2e348b74b102f3b2eb7d70b2ca316e27b71706d4a556abf3fff306031bd97862"
  },
  {
    "name": "محمد مجتبی بناکار",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:3",
    "pk": "2315f938cd2a6979a6778b2ecf77262169fd54d9e0484ea98a4fe87f25fda9a7"
  },
  {
    "name": "ایلیا بیگدلی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:4",
    "pk": "e41995250a3ad341337dc20c9919a2d63e2c4b59f1f112231f3f4ccfd6482265"
  },
  {
    "name": "محمد حسین جاهدی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:5",
    "pk": "58f0497957368c3d4e3ff161bc2cfc8b85800bed81b68362dae7b42cbd50b8f4"
  },
  {
    "name": "سید امیر علی جعفری",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:6",
    "pk": "095f83b2648b3752a94d5f6acfd7534388b8c06c503df9eccf882a78118f38e7"
  },
  {
    "name": "محمد جمشیدی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:7",
    "pk": "1c9a8aa4a55f7230ee36657b41417ad6793ad4b102001c96aa9e1d134e0dc15b"
  },
  {
    "name": "نوید حقیقی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:8",
    "pk": "e3ae9796ee00582d411d19f3c379a843c36a04e3e6d95abed014081fb5623746"
  },
  {
    "name": "امیر حسین دالوند",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:9",
    "pk": "034f0fbc8fd56b487c87f3dc950026127d391ce0f4da6091ccfb26777632bf60"
  },
  {
    "name": "محمد علی ستوده",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:10",
    "pk": "968249cf1256d5d7ab9c26a81a81b4d345529a018bfb71adc3f81fd146da78cd"
  },
  {
    "name": "سید حسین سیف",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:11",
    "pk": "fde63b329ec76c7f6021e862b2309858a79545a8b955f293197303a75abb60f1"
  },
  {
    "name": "علیرضا شریعتی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:12",
    "pk": "7329e44c978bef8d459019061ebbaa19379d330da85eae720c1d14accd9f74a3"
  },
  {
    "name": "سید محمد شنطیائی زاده",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:13",
    "pk": "5cc5a2224e97e8658406feb8202e03afc1bd33fec44137fd3dd09309c11b72bb"
  },
  {
    "name": "امیر حسین طاهری پور",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:14",
    "pk": "96f33f9127e5b15428829adec3942f1de446469c41ee4f2090a7fced4e827cc6"
  },
  {
    "name": "رادین عباسی غجه بیگلو",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:15",
    "pk": "e6fb1b28c4a85264b83745e2dd1ff46a841016658686e9843135dbfda28ce637"
  },
  {
    "name": "محمد حسین عباسی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:16",
    "pk": "0ad03d126b1defd24321c1f4961800e98bbfa66be8e89bf1290d0593fd03d43b"
  },
  {
    "name": "سید علی عکسری",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:17",
    "pk": "d8c082af2112a51d46bc95239ca304c700b56dabd5d9c344ec95ec1476d4172c"
  },
  {
    "name": "امیر حسین فلاح تفتی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:18",
    "pk": "d4099107dd4bedae49f76e19191f7264f2c222fae56478693e4300ad3d13131a"
  },
  {
    "name": "امیرعلی قهرمانی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:19",
    "pk": "1dd4b009379f26862c1c849bb3dd9beb48ccc8c5cf36213527609f79fcb483db"
  },
  {
    "name": "کیاوش محمدی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:20",
    "pk": "b0fe469e38775970851cefaed2cc886dde6fbcb707d2796ae7baeeafa970dae9"
  },
  {
    "name": "علی مهدی مداح",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:21",
    "pk": "e4a4c29e6b1e250dfce53fd7b678b51cbd471f5bd6ea44367e6781f424fa4fc4"
  },
  {
    "name": "امین مرتضوی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:22",
    "pk": "47aef633ccecafdaf0adfed6aea1c8d5010320c4e27d2773bd4851cf3ca8bbb7"
  },
  {
    "name": "علی نگهبان",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:23",
    "pk": "b7ff29d5b2beffcf4158621b448589f8ebaded0f85f11f7b00db995fe4184b82"
  },
  {
    "name": "ابوالفضل وفاداری",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:24",
    "pk": "9217619b68dc176891e191d50013abef9db0847291f12c80f857b7078fc2ca45"
  }
];
let messages = [];
let socket;
connected = false;

const load_elements_fix = () => {
  message_footer.style.display = "flex";
  sk_input.style.display = "none";
  sk_set.style.display = "none";
  sk_anon.style.display = "none";
  btn_logout.style.display = "block";
  const u = users.find(u=>u.pk==user.pk);
  user_info.innerText = "وارد شده به عنوان "+(u?u.name:(user.pk.substr(0,4)+".."+user.pk.substr(-4)+" ("+user.name+")"));
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
      alert("اسم باید بیش از 2 حرف باشه");
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
  const date_info = (date) => {
    const cy = new Date().getFullYear();
    const y = date.getFullYear();
    const fd = date.toLocaleDateString("en-US",{month:"long",day:"numeric"});
    if (y==cy) {
      return fd;
    } else {
      return `${fd},${y}`;
    }
  }
  messages = messages.sort((a,b)=>(a.created_at>b.created_at)?1:-1);
  if (messages.length>msg_limit) {
    messages.splice(0,messages.length-msg_limit);
  }
  messages_div.innerHTML = "";

  for (let i=0;i<messages.length;i++) {
    if ((messages[i].created_at-(i>0?messages[i-1].created_at:0))>60*60*24) {
      const date = document.createElement("div");
      date.classList.add("info");
      date.innerText = date_info(new Date(messages[i].created_at*1000));
      messages_div.appendChild(date);
    }
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
    const u = users.find(u=>u.pk==messages[i].pubkey)
    if (u) {
      name.innerText = (u.name||(messages[i].pubkey==user.pk?"You":messages[i].pubkey));
      name.innerHTML += "<div class=\"name_icon\" style=\"background-image:url('./img/icons/"+u.path.split(":")[2]+".png')\">";
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
