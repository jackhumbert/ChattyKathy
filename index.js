ph_lu = {
  "«": "",
  "»": "",
  "?": "",
  ",": "ʔ",
  ".": "ʔ",
  " ": " ",
  "ˈ": "ˈ",
  a: "a",
  e: "ɛ",
  i: "i",
  o: "o",
  u: "u",
  y: "ə",
  ai: "aj",
  ei: "ɛj",
  oi: "oj",
  au: "aw",
  ia: "ja",
  ie: "jɛ",
  ii: "ji",
  io: "jo",
  iu: "ju",
  ua: "wa",
  ue: "wɛ",
  ui: "wi",
  uo: "wo",
  uu: "wu",
  iy: "jə",
  uy: "wə",
  c: "ʃ",
  j: "ʒ",
  s: "s",
  z: "z",
  f: "f",
  v: "v",
  x: "x",
  "'": "h",
  dj: "dʒ",
  tc: "tʃ",
  dz: "ʣ",
  ts: "ʦ",
  r: "ɺ",
  n: "n",
  m: "m",
  l: "l",
  b: "b",
  d: "d",
  g: "g",
  k: "k",
  p: "p",
  t: "t"
}

String.prototype.matchForm = function(form) {
  var regex = "^";
  var working = this.replace(/[\.\?»«]/, '');
  for (var f = 0; f < form.length; f++) {
    if (form[f] == "C")
      regex += "[^aeiouy]";
    if (form[f] == "V")
      regex += "[aeiouy]";
  }
  regex += "$";
  var re = new RegExp(regex);
  return re.test(working);
}

String.prototype.isBrivla = function() {
  return this.matchForm("CCVCV") ||
         this.matchForm("CVCCV");
}

var awsCredentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:375f6ca5-3f02-4e61-b59f-4bf3fd51176b',
});

var settings = {
  awsCredentials: awsCredentials,
  awsRegion: "us-east-1",
  pollyVoiceId: "Brian",
  cacheSpeech: true
}
var kathy = ChattyKathy(settings);

function speak() {
  if (kathy.IsSpeaking()) {
    kathy.ShutUp(); 
  }
  var phs = "";
  t = document.getElementById('text').value;
  words = t.replace(/(?:\r\n|\r|\n)/g, ' ').split(' ');
  var output = "<s>\n";
  for (var w = 0; w < words.length; w++) {
    if (words[w] == ".i" || words[w] == "ni'o") {
      output += "</s>\n<s>\n";
    } else if (words[w][0] == ".") {
      output += '<break time="20ms" strength="x-weak" />\n';
    }

    var ph = '';
    for (var i = 0; i < [...words[w]].length; i++) {
      var c = [...words[w]][i];
      if ((words[w].matchForm("CV") || words[w].matchForm("CVV")) && (i == 0) && words[w+1] && !words[w+1].isBrivla())
        ph += 'ˈ';
      if ((words[w].matchForm("CVCV") || words[w].matchForm("CVCVV")) && (i == 0))
        ph += 'ˈ';
      if (words[w].matchForm("CVCCV")) {
        if (i == 0)
          ph += 'ˈ';
        if (i == 3)
          ph += '.';
      }
      if (words[w].matchForm("CCVCV")) {
        if (i == 0)
          ph += 'ˈ';
        if (i == 3)
          ph += '.';
      }
      if (ph_lu[[...words[w]][i-1] + c])
        ph += ph_lu[[...words[w]][i-1] + c];
      else if (ph_lu[c + [...words[w]][i+1]])
        continue;
      else
        ph += ph_lu[c];
    }
    phs += ph;
    phs += " ";
    output += '<phoneme alphabet="ipa" ph="' + ph + '">' + words[w] + '</phoneme>\n';  
    if (words[w][words[w].length - 1] == ".") {
      output += '<break time="20ms" strength="x-weak" />';
    }
  }
  output += "</s>\n";
  phonemes = '<speak><prosody rate="slow">' + output + '</prosody></speak>';
  document.getElementById('ipa').value = phs;
  document.getElementById('ssml').value = phonemes;
  kathy.Speak(phonemes);
  kathy.ForgetCachedSpeech();
}