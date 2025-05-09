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
    const u = users.find(u=>u.pk==user.pk);
    if (u) {
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
    "name": "دضغیب."
    "path": "dazgheib:0:0:0",
    "pk": "13b2f952d3f0eefe01214113ac47def4ded519678a3ddd086d66a6e64ff2332a"
  },
  {
    "name": "ماهان برزگری",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:0",
    "pk": "7db4f365fd6e6d5320177728dfc0329f5ac64e07fff5b4e5f626372779f7c217"
  },
  {
    "name": "سعید تابع بردبار",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:1",
    "pk": "b97ea93a9547547e999b3f0b5a2033e01afcdeb4b4fa8672ebe57ba10f528e5a"
  },
  {
    "name": "سید محسن تقوی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:2",
    "pk": "4d2c82e9ca674fbcebe13dc90d704ac83936dff531bf7e82deec2561fc52e21a"
  },
  {
    "name": "امیرعلی خالصی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:3",
    "pk": "fd609bac33126f15a44bdc1ab948b81eaa11a7bf6dfb0ff65c0b90fab4570406"
  },
  {
    "name": "یاسین دهقان",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:4",
    "pk": "dc203592606fd7a6ab2d9eb7b47f948a33b60b8fcc23a1c63594511b47dc36b0"
  },
  {
    "name": "علیرضا رحمانی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:5",
    "pk": "18fc07bf72279714ebeff19a19636846a9d9f4a8f6d0af851804c2bd7bf0ffc7"
  },
  {
    "name": "محمدرضا رحمانی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:6",
    "pk": "5bb5a4faf8d63483c1225a52c8e4f25aaa6b305beea98c96258108d86c744383"
  },
  {
    "name": "آرمین رستمی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:7",
    "pk": "07517ccd8c6a407b507b2680b7305a4fcc6385358ae11d4c0f9e9b267717e4c9"
  },
  {
    "name": "امیرحسین رضائی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:8",
    "pk": "733204bb5112cfb48a1abbbe658610a254ef26710d57349faf3ec4485f6a1c50"
  },
  {
    "name": "پارسا رنجبران",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:9",
    "pk": "37f4066e06ffa7efaac5e49fb8bf30758380074c4cb5cb06f5e921b36c4bcccc"
  },
  {
    "name": "شایان زارع",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:10",
    "pk": "ca9e59888e7c6a655493284d2cae5ddc03dcb1fd61c850f7240650dcbdd6ce92"
  },
  {
    "name": "محمدمهدی زارع",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:11",
    "pk": "8248405aeb0ae2aa89b42c3c406139d6a36b54aa03948d79cfbb4a967604ebb7"
  },
  {
    "name": "امیرعلی سالاری",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:12",
    "pk": "185cf470a1ef2f278bd8888f92688b661dffe51a41999121e684fb0d90a80f8a"
  },
  {
    "name": "سپهر صفی خانی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:13",
    "pk": "71c75e876be07711b0561bd46ea5b325be3b8ac60a952953fb1709fea75c67f9"
  },
  {
    "name": "عرشیا عدالت",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:14",
    "pk": "1418cdd1694e4fdab276aed09ccf857f5c389c4e5ecf47437e2c4d2cf26ae330"
  },
  {
    "name": "امیررضا عمادی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:15",
    "pk": "bdb57ceef3cb9483989b0a2e0ad9d4a913a98012b82f471adc2f08ae0343ce5d"
  },
  {
    "name": "سید امیررضا فلاح زاده",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:16",
    "pk": "127ad800a5de2251edead65af96d508c1be58344bc7d520e2e7c7094cdc75838"
  },
  {
    "name": "آرتان قطبی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:17",
    "pk": "f21f12ced89ec9da6844a1f11e80adaa5cd8f882d0f5c1829a29650e84f5fdb5"
  },
  {
    "name": "محمدامین کامیاب کلانتری",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:18",
    "pk": "62af3121865d090aa458302a02e3d8fddc33bff87cbcb68836f07a8f1627ba78"
  },
  {
    "name": "علیرضا مجرب",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:19",
    "pk": "143f513e9809d443263a5306675302010d8cb8e9e565fe62250fa30a8880bb3e"
  },
  {
    "name": "امیرحسین محمدی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:20",
    "pk": "ec57d84be1b27c4cb403fac6a1450c0c384e6e8e01dc44aaa515e668c66dbcf5"
  },
  {
    "name": "محمد مردانی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:21",
    "pk": "a59b6b63c6104b74b663c0eb14ca80869f55707e6ffcc60186908f0623de301f"
  },
  {
    "name": "امیرحسین معتضدی",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:22",
    "pk": "7e13ab8c4dbe9c24ad1bb05fe1fa18db2a7a4c85f99f272d516fa398e7eaff01"
  },
  {
    "name": "امیرعلی میرشکار زاده",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:23",
    "pk": "90207315bf63859e308b7dcde2fdeb59cc859b899b8cfe462f94ed2f86da06dd"
  },
  {
    "name": "شهنام نگهداری",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:24",
    "pk": "90a2b7cc5253f13f55a4605c34db6801f805d5b2904dc47aea83fe647ab6bc6b"
  },
  {
    "name": "باوند هنرپیشه",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:25",
    "pk": "71f477f6b003800e66480061dfa515e720b94a8c4872cc261bc616ab3d86dff4"
  },
  {
    "name": "امیرمحمد هوشیار",
    "path": "dazgheib:3:3:0:1402:0:0:0:0:26",
    "pk": "63815a001db86558b4c2015a29124e26bbea7f4b062d34e31b72dfef7e0cdf31"
  },
  {
    "name": "امیرحسین آجرلو",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:0",
    "pk": "6fa8d96deef6f4d9183997095a93d6a2593fb26af556e85329bb02477323a84c"
  },
  {
    "name": "اشکان اسکندری",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:1",
    "pk": "1262961eb59055e305049cbb7d045ff7d583399d3a75494afce12a12a7523e91"
  },
  {
    "name": "امیرعلی اسمعیل نژاد",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:2",
    "pk": "dcbca7455764bab7bd1f2b178a815b090f441aafbd2abc66b99bc258fe655a70"
  },
  {
    "name": "نیما جلالی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:3",
    "pk": "b888f0236d492df07f69c20e33f779a47bbcb8f7941a4db283a147089e8927b3"
  },
  {
    "name": "امین علی حدادباخدائی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:4",
    "pk": "5dbf9b874d07286503215091a9f5c1560d616534268d0653f394b337a5f5a13c"
  },
  {
    "name": "سید امیرحسین حدیقه",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:5",
    "pk": "f4e21051ca503a6017515237325ca32e7caecc313b9050fe0aad766e88cf68b4"
  },
  {
    "name": "محمدیوسف حق جو",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:6",
    "pk": "969193ba67ccdc0f9a518294a76da12969b2deb32448ab674139c04df49224a4"
  },
  {
    "name": "محمدسینا خردمندحقیقی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:7",
    "pk": "7d48fac56b374d5e39d5881a20483cbc9a19e4f2d3df657dc8fe3095a9546a0e"
  },
  {
    "name": "محمدرضا زارع",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:8",
    "pk": "fc86ce5fd28c6e652f811314d712759961290901cf9013c6f6f77e5091295993"
  },
  {
    "name": "دانیال زمانی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:9",
    "pk": "fb2a4c840c83bef695f5fa2ee0dc753f874e22ccc0ccdbac3abc07dc34265926"
  },
  {
    "name": "محمدرضا سالاری",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:10",
    "pk": "cdde60c0c26e3dcbadad3dadac15b0e1089c3a607c2c9b9b109767e6f4ea4c07"
  },
  {
    "name": "علی شاهین",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:11",
    "pk": "505826ca8a58a388f7b90d0414f4300a27d84253da5c093c2b3c36dd60385e18"
  },
  {
    "name": "امیرحسین شفیعی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:12",
    "pk": "c13a96031a60dc1466107f40902f3ce08ced79fc5f29e45edca03bd347115471"
  },
  {
    "name": "حسین رضا صحت پور",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:13",
    "pk": "22b2133469c60448bf5c7a11312d8c3f35138aed1fbdd64cc48e61349d7dace4"
  },
  {
    "name": "کسری عباسی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:14",
    "pk": "9845631c9fd7242691407a0f16357b894cfbe775645ec69ce6190ca97422a10a"
  },
  {
    "name": "عرشیا علی نژاد منفرد",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:15",
    "pk": "1beaaf567783d5d3f992bd63e2d16295810b3ccd437fd93c0759456a671eb8e8"
  },
  {
    "name": "مهراد فقیه ملک مرزبان",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:16",
    "pk": "eb1873f4845948e719a08e2cbf1ae1a62abd1147fe2240a4a8ccbfa9a8360494"
  },
  {
    "name": "احمد قربانی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:17",
    "pk": "e59465fdc934ff89b48111acca446385b60fda855f0b409c579187c43dabfda5"
  },
  {
    "name": "ایمان کرمی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:18",
    "pk": "807c186e2cad9ed13fc48e830d3d61b5b68de96bbfa126e84416809a971dd65f"
  },
  {
    "name": "محمدطاها محمدزاده شیرازی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:19",
    "pk": "1d4e53f1a96b96f6a88dfa68862ee1560ce9334c1fdefdae466050f98c683dc6"
  },
  {
    "name": "امیر محمدی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:20",
    "pk": "03a55bb76eeb82a4e146bc077bd68d55a25095105088b6fadeb0d74bffc49a85"
  },
  {
    "name": "سید امیرحسین محمدی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:21",
    "pk": "457fe43354e10bda0b4d26cc15a3fe639daa4931e861a052a8b7cc6082aed5dc"
  },
  {
    "name": "پویا معماری",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:22",
    "pk": "25649ef68425244f57a8a4294498ace1c74b56bbeebe2d3da9dd05e7b42ffbc0"
  },
  {
    "name": "سید محمدامین میری",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:23",
    "pk": "5965b87b7dd3582601cd079b28cd4c285b778a3c3fb2edf33c1920cfc404827b"
  },
  {
    "name": "امیرحسین نقیبی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:24",
    "pk": "0171fa411d9f2a4190dfd3bc0e026996a36d8cba0a4cc26c15d23cce3dadb427"
  },
  {
    "name": "محمدابراهیم یغمور",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:25",
    "pk": "f1bfcd2d17b2ed3ecbbb6ae6f47c9e7935df53ae02c11829b54816a6e4895fcd"
  },
  {
    "name": "ابوالفضل یوسفی ده بیدی",
    "path": "dazgheib:3:3:0:1402:0:0:1:1:26",
    "pk": "17d967650b9ff7f9521887c3ca3081b3d6441b17cb60597cc6e1601267dbb91e"
  },
  {
    "name": "امیرمحمد افشار",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:0",
    "pk": "5e7aaa31b55f3deafc8669a7d5e872b9c4be2a6992d80e0100107a9868be5e87"
  },
  {
    "name": "حسین امینی لاری",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:1",
    "pk": "900bdb6bc7fea3fa1803954cc4d1e8809ac111c7ad51c553aba02465f5c32c87"
  },
  {
    "name": "امیرعباس آزاد",
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
    "name": "امیرمحمد دهقانی قطب آبادی",
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
    "name": "محمدطاها رحیمی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:9",
    "pk": "33d7a321fe8a630e81b3682e95a471280d0f7a2283860463c3f290b818506708"
  },
  {
    "name": "امیرپویا رضایی حقیقی",
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
    "name": "امیرعلی سیاران",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:16",
    "pk": "bc161fcc6ba15cc93822dcca1112bfc6af52acb0d2911fd82cffe851b6b7bbce"
  },
  {
    "name": "امیرحسین شکری",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:17",
    "pk": "900313637ec443e5484cd4f27c606ae42fc36d0f1e3b7750976fb345af25999b"
  },
  {
    "name": "شهرام صفرپور",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:18",
    "pk": "158d1ba7028529c3a0c62c7e6d462785de1fac7a11efb0e1635156580a4b4552"
  },
  {
    "name": "امیرمحمد عابدی",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:19",
    "pk": "d5a6de7912d8594d443d16967e8821bf6383e86454c3d185135af4d93764bdea"
  },
  {
    "name": "امیررضا غریب",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:20",
    "pk": "04dd3113d31f09b8dcab80cc260d80d7b70355f908d6100d6c001579ef64025a"
  },
  {
    "name": "امیرارسلان کوثری",
    "path": "dazgheib:3:3:0:1402:0:0:2:2:21",
    "pk": "b01cf8a7d8225c73f35c97e2dc447fc14112d59593ed57d646ec0e395fb4b21c"
  },
  {
    "name": "امیرعلی معتضدیان",
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
    "name": "محمدمجتبی بناکار",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:3",
    "pk": "2315f938cd2a6979a6778b2ecf77262169fd54d9e0484ea98a4fe87f25fda9a7"
  },
  {
    "name": "ایلیا بیگدلی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:4",
    "pk": "e41995250a3ad341337dc20c9919a2d63e2c4b59f1f112231f3f4ccfd6482265"
  },
  {
    "name": "محمدحسین جاهدی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:5",
    "pk": "58f0497957368c3d4e3ff161bc2cfc8b85800bed81b68362dae7b42cbd50b8f4"
  },
  {
    "name": "سید امیرعلی جعفری",
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
    "name": "امیرحسین دالوند",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:9",
    "pk": "034f0fbc8fd56b487c87f3dc950026127d391ce0f4da6091ccfb26777632bf60"
  },
  {
    "name": "محمدعلی ستوده",
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
    "name": "امیرحسین طاهری پور",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:14",
    "pk": "96f33f9127e5b15428829adec3942f1de446469c41ee4f2090a7fced4e827cc6"
  },
  {
    "name": "رادین عباسی غجه بیگلو",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:15",
    "pk": "e6fb1b28c4a85264b83745e2dd1ff46a841016658686e9843135dbfda28ce637"
  },
  {
    "name": "محمدحسین عباسی",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:16",
    "pk": "0ad03d126b1defd24321c1f4961800e98bbfa66be8e89bf1290d0593fd03d43b"
  },
  {
    "name": "سید علی عکسری",
    "path": "dazgheib:3:3:0:1402:1:1:0:0:17",
    "pk": "d8c082af2112a51d46bc95239ca304c700b56dabd5d9c344ec95ec1476d4172c"
  },
  {
    "name": "امیرحسین فلاح تفتی",
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
  },
  {
    "name": "محمدصادق ارزاقی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:0",
    "pk": "d3d34843cd8f9193f61b4d19a07225f6d9e0464dac001c160fcf9ed631e3a60b"
  },
  {
    "name": "مسیحا الهی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:1",
    "pk": "780bea1edd79e36cd178f68d1422d8c681641793aa078a5b539442b4f0ac0a20"
  },
  {
    "name": "رهام بهاری",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:2",
    "pk": "3814f703f8e36b916d7ce28796a81e68df78a3bc9382528868d26e5353e4f33f"
  },
  {
    "name": "ایلیا بهمنی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:3",
    "pk": "6b9df3548610dc8aa18b19f13c1b4a1824ac9c372e0658e5c198d9446490d2d0"
  },
  {
    "name": "محمدامین حسنی حقیقی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:4",
    "pk": "d617002427a06c42082a43da645ff49ae963e4c363edd1b1ba016ad37a06fe54"
  },
  {
    "name": "حسین خورشیدی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:5",
    "pk": "c4be7fffd62ee8cb0711ac010accbfaa8a28fb8b34a314705fc4e86fe1530fbc"
  },
  {
    "name": "محمدجواد رستمی ابوالوردی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:6",
    "pk": "973f11abcac70f0f95ba02b1ab5a177d85b491e1f524e1ccf440997a5e031070"
  },
  {
    "name": "سپنتا ستوده",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:7",
    "pk": "d7bad30c0a97974dac1e5279a846f01e0f0948e6782642398e0ed4253dfc91e2"
  },
  {
    "name": "سعیدرضا ستوده",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:8",
    "pk": "31e16ae1a65b2b2bfae5a29c4f63821ed099ef3a704e21cea176ba4e52586557"
  },
  {
    "name": "علیرضا شادی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:9",
    "pk": "2c1f1ce102248023e24b4038572f208daeb88b2b5cf6627f3691b7cd68d8d53b"
  },
  {
    "name": "محمدمتین شاهد",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:10",
    "pk": "f88dcf5f31736e03ace2443b998dc858818c0721be5d3623c131fa76d168c30e"
  },
  {
    "name": "مبین شریف زاده",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:11",
    "pk": "8abd9b11a67de3d1967713b59599af1bd6d440403f7df514039650e122c80e28"
  },
  {
    "name": "سید امیرحسین علوی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:12",
    "pk": "12fa26eeb79b97259b1ec45efe576b22bf1aacf45bfde5d032f8b6d6eef0e252"
  },
  {
    "name": "محمد علی پور",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:13",
    "pk": "0de5fd0c3c423dd18b261dbd11c6b1812338e693beeb66af9c99c6b3ff948547"
  },
  {
    "name": "ایلیا غفاری خوارستان",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:14",
    "pk": "4d8ab217026bcacf7248fbb2917a2f9065e0e15ebb3d14a548d06dde1884da59"
  },
  {
    "name": "محمدیاسین فرهادی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:15",
    "pk": "3f889265341d75b57d51a0a91b306149341870353857aeeff7261d48a9b833a1"
  },
  {
    "name": "طاها فرهمندی اردکانی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:16",
    "pk": "a754348de98f7ee470fbc0570b60e67c37f2269e5e6b5733ea0e20af783f35be"
  },
  {
    "name": "امیدرضا فولادی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:17",
    "pk": "0e09267db0c09a630c69e39ac8ea648fd178f10d505f3cd117d18ca5c5fd3a1d"
  },
  {
    "name": "پارسا قبادی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:18",
    "pk": "8da7cef93b5f0467fdd2b46f3d56b284bb764d14f1dece8ecfaa6130eb6ec87c"
  },
  {
    "name": "محمدرضا مباشری",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:19",
    "pk": "eb4e0669be9c0bbafc90643e54fca24e087d5b10ff92655d38c9f4386822d87e"
  },
  {
    "name": "محمدمتین محمدی زاده فرد",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:20",
    "pk": "de2f6ef672e2db38f42cbbce76b4ddeb67d6da9664a96161e3b77e5591d2d7df"
  },
  {
    "name": "محمدرضا مرتضوی",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:21",
    "pk": "ae109e692217da5ea5a5d8cfa2c4e2812364b223c8785b789f9a5979ed35a564"
  },
  {
    "name": "یزدان هادی نژاد",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:22",
    "pk": "5b41d523ca8c86b57b6014f71b071327e04ce21cbefa5d9e5a14c71732e15cd3"
  },
  {
    "name": "سید امیرمحمد هندی زاده",
    "path": "dazgheib:3:3:0:1402:1:1:1:1:23",
    "pk": "8724f0c48e3d8533bad56ff8db1bb990593b4b42bcb096617b0faf57ae8d013d"
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
    sk_input.value = "";
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
      "kind": 5,
      "tags": [["e",id]],
      "pubkey": user.pk
    };
    const signed = await sign(event,user.sk);
    socket.send(JSON.stringify(["EVENT",signed]));
    const index = messages.findIndex(message=>message.id==id);
    if (index!=-1) {
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
