/**
 * Journey Trail 2: Trail of the Living Water. Structure, scenes and treasures.
 * Band texts live in content-src/j02-*.mjs and are merged by scripts/convert-prototypes.mjs.
 */
const v = (en, enRef, af, afRef) => ({ en: { text: en, refText: enRef, wording: "simple" }, af: { text: af, refText: afRef, wording: "simple" } });
const t = (enGem, afGem, enTrait, afTrait) => ({ gem: { en: enGem, af: afGem }, trait: { en: enTrait, af: afTrait } });
const story = (id, scene, treasure) => ({ id, kind: "story", scene, treasure });
const camp = (id, scene, special) => ({ id, kind: "campfire", scene, ...(special ? { special } : {}) });

export default {
  id: "j02", kind: "journey", order: 2,
  title: { en: "Trail of the Living Water", af: "Die Pad van die Lewende Water" },
  blurb: {
    en: "From desert wells to the early church: meet the God who sees you, makes you brave, fills you with His Spirit and sends you out to shine.",
    af: "Van woestynputte tot by die eerste kerk: leer die God ken wat jou sien, jou dapper maak, jou met sy Gees vul en jou uitstuur om te skyn.",
  },
  expeditions: [
    {
      id: "j02-e1", color: 4,
      title: { en: "Wells in the Desert", af: "Putte in die Woestyn" },
      blurb: { en: "A runaway, a servant, a dreamer and two brothers discover the God who sees, guides and makes peace.", af: "’n Weghardloper, ’n dienskneg, ’n dromer en twee broers ontdek die God wat sien, lei en vrede maak." },
      memoryVerse: v("You are the God who sees me.", "Genesis 16:13", "U is die God wat my sien.", "Genesis 16:13"),
      nights: [
        story("j02-n01", "day desert well ; 🌴70,150,50 👩‍👦250,168,40", t("El Roi", "El Roi", "God sees me when I feel alone", "God sien my as ek alleen voel")),
        story("j02-n02", "sunset desert well ; 🐫80,166,44 🐫120,170,36 👧290,166,38", t("Leads Me", "Lei My", "God guides my steps", "God lei my treë")),
        story("j02-n03", "day desert well ; ⛏️110,170,30 🐑300,170,30 💧200,110,24", t("Makes Room", "Maak Plek", "God makes room for me", "God maak vir my plek")),
        story("j02-n04", "night desert ladder ; 🪨120,172,26 😴150,168,30 👼200,80,26", t("With Me Everywhere", "Oral by My", "God is with me wherever I go", "God is by my oral waar ek gaan")),
        story("j02-n05", "dawn river ; 🤼200,160,46 🌅320,90,30", t("New Name", "Nuwe Naam", "God changes who I am", "God verander wie ek is")),
        story("j02-n06", "sunset hills ; 🧔130,166,40 🫂200,162,36 🧔270,166,40", t("Peacemaker", "Vredemaker", "God brings peace between people", "God bring vrede tussen mense")),
        camp("j02-n07", "night campfire ; 🔥200,165,54 🐫80,166,44"),
      ],
    },
    {
      id: "j02-e2", color: 2,
      title: { en: "Valley of Courage", af: "Die Vallei van Moed" },
      blurb: { en: "Ordinary people, extraordinary courage: a judge under a palm tree, a farmer hiding in a winepress, a praying mother, a boy king and a wall-builder.", af: "Gewone mense, buitengewone moed: ’n rigter onder ’n palmboom, ’n boer wat in ’n parskuip wegkruip, ’n biddende ma, ’n seunkoning en ’n muurbouer." },
      memoryVerse: v("‘Not by might nor by power, but by my Spirit,’ says the Lord.", "Zechariah 4:6", "‘Nie deur krag of deur geweld nie, maar deur my Gees,’ sê die Here.", "Sagaria 4:6"),
      nights: [
        story("j02-n08", "day hills ; 🌴90,150,58 👩‍⚖️200,166,40 ⚔️300,166,30", t("Courage", "Moed", "God gives courage to lead", "God gee moed om te lei")),
        story("j02-n09", "day hills ; 🌾110,170,30 🧑‍🌾170,168,36 👼280,110,40", t("Calls Me Brave", "Noem My Dapper", "God sees who I can become", "God sien wie ek kan word")),
        story("j02-n10", "night hills ; 🎺120,168,28 🔥200,168,26 🏺280,170,26", t("Victory", "Oorwinning", "The victory comes from God", "Die oorwinning kom van God")),
        story("j02-n11", "day town ; 🙏200,162,40 🕯️300,168,24", t("Hears Prayer", "Hoor Gebed", "God hears my deepest prayers", "God hoor my diepste gebede")),
        story("j02-n12", "day town ; 👑170,118,28 👦170,166,40 📜250,168,30", t("Young Heart", "Jong Hart", "God uses young people who love Him", "God gebruik jong mense wat Hom liefhet")),
        story("j02-n13", "day desert walls ; 🧱120,172,26 🔨200,172,26 🙏290,170,30", t("Builder", "Bouer", "God helps me do hard work with prayer", "God help my om moeilike werk met gebed te doen")),
        camp("j02-n14", "night campfire ; 🔥200,165,54 🎺320,166,36"),
      ],
    },
    {
      id: "j02-e3", color: 3,
      title: { en: "Wisdom and Wonders", af: "Wysheid en Wonders" },
      blurb: { en: "A king asks for wisdom, ravens deliver dinner, God whispers, an invisible army appears, and empty jars overflow.", af: "’n Koning vra vir wysheid, kraaie bring aandete, God fluister, ’n onsigbare leër verskyn, en leë kanne loop oor." },
      memoryVerse: v("If any of you lacks wisdom, ask God, who gives generously to all.", "James 1:5", "As iemand van julle wysheid kortkom, moet hy dit van God vra, wat aan almal mildelik gee.", "Jakobus 1:5"),
      nights: [
        story("j02-n15", "night town ; 👑200,150,34 💤140,160,24 ✨260,90,24", t("Wisdom", "Wysheid", "God gives wisdom when I ask", "God gee wysheid as ek vra")),
        story("j02-n16", "day river ; 🐦‍⬛140,90,30 🐦‍⬛190,80,26 🍞200,166,24 🧔280,166,38", t("Never Runs Out", "Raak Nooit Op", "God provides in surprising ways", "God voorsien op verrassende maniere")),
        story("j02-n17", "dawn mountain ; 🌬️90,70,32 🔥310,80,26 🕳️200,152,30", t("Gentle Whisper", "Sagte Fluistering", "God speaks in a gentle whisper", "God praat met ’n sagte fluistering")),
        story("j02-n18", "dawn hills ; 🔥110,90,30 🐎170,80,30 🔥240,70,30 🐎300,90,30 🧑200,170,34", t("Unseen Army", "Onsigbare Leër", "God protects me more than I can see", "God beskerm my meer as wat ek kan sien")),
        story("j02-n19", "day town ; 🏺150,168,30 🏺200,168,30 🏺250,168,30 🫗300,140,30", t("Overflowing", "Oorvloei", "God fills empty places", "God vul leë plekke")),
        story("j02-n20", "day town ; 🏠200,140,44 🧒200,170,30 🙏270,168,30", t("Gives Life", "Gee Lewe", "God has power over life", "God het mag oor die lewe")),
        camp("j02-n21", "night campfire ; 🔥200,165,54 👑320,166,34"),
      ],
    },
    {
      id: "j02-e4", color: 5,
      title: { en: "Jesus the Healer", af: "Jesus die Geneser" },
      blurb: { en: "Water becomes wine, a roof gets opened, a trembling hand touches a cloak, and Jesus teaches us how to love and how to pray.", af: "Water word wyn, ’n dak word oopgemaak, ’n bewende hand raak aan ’n mantel, en Jesus leer ons hoe om lief te hê en hoe om te bid." },
      memoryVerse: v("Jesus Christ is the same yesterday and today and forever.", "Hebrews 13:8", "Jesus Christus is gister en vandag dieselfde, en tot in ewigheid.", "Hebreërs 13:8"),
      nights: [
        story("j02-n22", "day town ; 🏺140,168,30 🍷200,160,30 🎉270,110,28", t("Joy-Giver", "Vreugdegewer", "Jesus brings joy and does the impossible", "Jesus bring vreugde en doen die onmoontlike")),
        story("j02-n23", "day town ; 🛏️200,104,30 👥110,168,30 🧑‍🤝‍🧑290,168,30", t("Forgiver", "Vergewer", "Jesus forgives and heals", "Jesus vergewe en genees")),
        story("j02-n24", "day town ; 👥110,168,34 🤲200,168,30 🧥250,162,30", t("Notices Me", "Sien My Raak", "Jesus notices me in the crowd", "Jesus sien my raak in die skare")),
        story("j02-n25", "day town ; 🏠150,140,44 👧220,168,32 ✋270,150,26", t("Just Believe", "Glo Net", "Jesus says: don’t be afraid, just believe", "Jesus sê: moenie bang wees nie, glo net")),
        story("j02-n26", "day desert ; 🫏110,168,40 🧑‍🦯200,172,30 🩹260,160,24", t("Neighbour", "Naaste", "Jesus teaches me to love everyone", "Jesus leer my om almal lief te hê")),
        story("j02-n27", "sunset hills ; 🙏200,166,40 ✨260,90,24", t("Our Father", "Ons Vader", "God is our Father who loves to hear us", "God is ons Vader wat ons graag hoor")),
        camp("j02-n28", "night campfire ; 🔥200,165,54 🍷320,166,30"),
      ],
    },
    {
      id: "j02-e5", color: 6,
      title: { en: "The Living Water", af: "Die Lewende Water" },
      blurb: { en: "A thirsty woman, two busy sisters, a friend raised from the grave, a towel and a basin, a vine, and a prayer Jesus prayed for you.", af: "’n Dors vrou, twee besige susters, ’n vriend wat uit die graf opgewek word, ’n handdoek en ’n skottel, ’n wynstok, en ’n gebed wat Jesus vir jou gebid het." },
      memoryVerse: v("Whoever drinks the water I give them will never thirst.", "John 4:14", "Wie van die water drink wat Ek hom sal gee, sal nooit weer dors kry nie.", "Johannes 4:14"),
      nights: [
        story("j02-n29", "day desert well ; 🏺150,168,28 👩280,168,36", t("Living Water", "Lewende Water", "Jesus satisfies my thirsty heart", "Jesus les my dors hart")),
        story("j02-n30", "day town ; 🍲110,168,28 👩200,168,34 🧘‍♀️270,168,34", t("The Better Part", "Die Beste Deel", "Being with Jesus matters most", "Om by Jesus te wees, is die belangrikste")),
        story("j02-n31", "dawn hills tomb ; 🧑‍🦱250,170,30 🎉110,90,24", t("Resurrection", "Opstanding", "Jesus is the resurrection and the life", "Jesus is die opstanding en die lewe")),
        story("j02-n32", "night town ; 🪣170,170,28 🦶220,172,24 🧺280,168,26", t("Servant King", "Dienskneg-Koning", "Jesus serves, and teaches me to serve", "Jesus dien, en leer my om te dien")),
        story("j02-n33", "sunset hills ; 🍇140,140,34 🌿200,150,40 🍇260,140,34", t("Vine", "Wynstok", "I grow by staying close to Jesus", "Ek groei deur naby Jesus te bly")),
        story("j02-n34", "night hills ; 🙏200,166,40 ⭐300,60,20 🌙80,50,20", t("Prays for Me", "Bid vir My", "Jesus prays for me", "Jesus bid vir my")),
        camp("j02-n35", "night campfire ; 🔥200,165,54 💧320,160,30"),
      ],
    },
    {
      id: "j02-e6", color: 8,
      title: { en: "The Church on the Move", af: "Die Kerk op Pad" },
      blurb: { en: "A beggar leaps up, a brave martyr forgives, a traveller is baptised, an enemy is changed, and prison doors open.", af: "’n Bedelaar spring op, ’n dapper martelaar vergewe, ’n reisiger word gedoop, ’n vyand word verander, en tronkdeure gaan oop." },
      memoryVerse: v("I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes.", "Romans 1:16", "Ek skaam my nie oor die evangelie nie, want dit is ’n krag van God tot redding vir elkeen wat glo.", "Romeine 1:16"),
      nights: [
        story("j02-n36", "day town ; 🚪200,150,30 🦵160,170,28 🙌250,166,32", t("In Jesus’ Name", "In Jesus se Naam", "There is power in the name of Jesus", "Daar is krag in die Naam van Jesus")),
        story("j02-n37", "sunset town ; ✨200,70,28 🙏200,166,36", t("Full of the Spirit", "Vol van die Gees", "The Spirit helps me forgive and stay brave", "Die Gees help my om te vergewe en dapper te bly")),
        story("j02-n38", "day desert ; 🐴110,166,40 📜170,160,24 💧290,168,30", t("Good News", "Goeie Nuus", "God sends me to share the good news", "God stuur my om die goeie nuus te deel")),
        story("j02-n39", "day desert ; ⚡200,50,34 🐴120,168,36 🧔240,170,34", t("Changes Anyone", "Verander Enigiemand", "Nobody is too far for God to change", "Niemand is te ver vir God om te verander nie")),
        story("j02-n40", "night town bars ; 👼200,100,40 ⛓️200,160,30", t("Answers Prayer", "Antwoord Gebed", "God answers when His people pray together", "God antwoord wanneer sy mense saam bid")),
        story("j02-n41", "night town bars ; 🎵140,90,26 🎵260,80,26 🙌200,160,34", t("Songs at Midnight", "Liedere om Middernag", "I can praise God even in hard times", "Ek kan God selfs in moeilike tye prys")),
        camp("j02-n42", "night campfire ; 🔥200,165,54 📜320,166,30"),
      ],
    },
    {
      id: "j02-e7", color: 7,
      title: { en: "Children of Light", af: "Kinders van die Lig" },
      blurb: { en: "How do God’s children live? Growing fruit, wearing God’s armour, loving like Jesus, using our gifts, and looking forward to a world made new.", af: "Hoe lewe God se kinders? Ons laat vrugte groei, dra God se wapenrusting, het lief soos Jesus, gebruik ons gawes, en sien uit na ’n wêreld wat nuut gemaak word." },
      memoryVerse: v("Live as children of light.", "Ephesians 5:8", "Lewe as kinders van die lig.", "Efesiërs 5:8"),
      nights: [
        story("j02-n43", "day garden tree ; 🍎280,80,22 🍐310,100,22 🍊330,70,22 🧒110,168,36", t("Fruit", "Vrug", "The Holy Spirit grows good fruit in me", "Die Heilige Gees laat goeie vrugte in my groei")),
        story("j02-n44", "day hills ; 🛡️150,160,40 ⚔️210,160,36 🪖270,160,32", t("Armour", "Wapenrusting", "God makes me strong in His power", "God maak my sterk in sy krag")),
        story("j02-n45", "sunset garden ; ❤️200,100,46 🤝200,168,30", t("Never Fails", "Vergaan Nooit", "God’s kind of love never fails", "God se soort liefde vergaan nooit")),
        story("j02-n46", "day town ; 🎁120,168,28 🎵170,160,26 🩹220,168,24 🙏270,168,28", t("Gifts", "Gawes", "God gives me gifts to help others", "God gee my gawes om ander te help")),
        story("j02-n47", "dawn garden rainbow ; 🏙️200,120,40 ✨140,80,24 ✨260,80,24", t("All Things New", "Alles Nuut", "God will make everything new", "God sal alles nuut maak")),
        camp("j02-n48", "night campfire star ; 🔥200,165,54 ⛺80,165,44 🧭320,166,36", "finale"),
      ],
    },
  ],
};
