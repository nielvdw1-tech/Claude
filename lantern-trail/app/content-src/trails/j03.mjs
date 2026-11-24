/**
 * Journey Trail 3: Trail of the Promise Keeper. Structure, scenes and treasures.
 * Band texts live in content-src/j03-*.mjs and are merged by scripts/convert-prototypes.mjs.
 */
const v = (en, enRef, af, afRef) => ({ en: { text: en, refText: enRef, wording: "simple" }, af: { text: af, refText: afRef, wording: "simple" } });
const t = (enGem, afGem, enTrait, afTrait) => ({ gem: { en: enGem, af: afGem }, trait: { en: enTrait, af: afTrait } });
const story = (id, scene, treasure) => ({ id, kind: "story", scene, treasure });
const camp = (id, scene, special) => ({ id, kind: "campfire", scene, ...(special ? { special } : {}) });

export default {
  id: "j03", kind: "journey", order: 3,
  title: { en: "Trail of the Promise Keeper", af: "Die Pad van die Beloftehouer" },
  blurb: {
    en: "From Abraham’s tent to the finish line of faith: discover the God who keeps every promise, and learn to run your race with Him.",
    af: "Van Abraham se tent tot by die eindstreep van geloof: ontdek die God wat elke belofte hou, en leer om jou wedloop saam met Hom te hardloop.",
  },
  expeditions: [
    {
      id: "j03-e1", color: 1,
      title: { en: "The Tent of Promises", af: "Die Tent van Beloftes" },
      blurb: { en: "A tower that reached too high, a journey into the unknown, a generous uncle, laughing visitors, a bold prayer and a ram on a mountain.", af: "’n Toring wat te hoog wou reik, ’n reis na die onbekende, ’n vrygewige oom, besoekers wat laat lag, ’n dapper gebed en ’n ram op ’n berg." },
      memoryVerse: v("Is anything too hard for the Lord?", "Genesis 18:14", "Is daar iets wat vir die Here te moeilik is?", "Genesis 18:14"),
      nights: [
        story("j03-n01", "day desert ; 🧱150,150,40 🏗️220,120,50 👷290,166,32", t("God’s Name", "God se Naam", "God’s name is greater than any name we make", "God se Naam is groter as enige naam wat ons maak")),
        story("j03-n02", "sunset desert ; 🐪90,166,44 ⛺200,160,40 🧔280,166,38", t("Follow", "Volg", "God leads me step by step", "God lei my tree vir tree")),
        story("j03-n03", "day hills ; 🐑100,170,28 🐑140,172,24 🧔220,166,36 👨300,166,34", t("Generous", "Vrygewig", "God provides, so I can be generous", "God voorsien, so ek kan vrygewig wees")),
        story("j03-n04", "day desert tree ; ⛺120,160,40 🧑‍🦳200,166,32 😂250,150,26", t("Nothing Too Hard", "Niks te Moeilik", "Nothing is too hard for God", "Niks is vir God te moeilik nie")),
        story("j03-n05", "sunset hills ; 🧔150,166,38 🙏210,166,32 ✨260,90,24", t("Friend Who Prays", "Vriend wat Bid", "God listens when I pray for others", "God luister as ek vir ander bid")),
        story("j03-n06", "dawn mountain ; 🐏260,150,34 🧔150,160,32 ✨200,50,24", t("Provider", "Voorsiener", "The Lord will provide", "Die Here sal voorsien")),
        camp("j03-n07", "night campfire star ; 🔥200,165,54 ⛺320,162,40"),
      ],
    },
    {
      id: "j03-e2", color: 4,
      title: { en: "The Wilderness School", af: "Die Woestynskool" },
      blurb: { en: "Water from a rock, tired arms held high, a tent where God lived, a glimpse of glory, giants in the land and a snake on a pole.", af: "Water uit ’n rots, moeë arms wat hoog gehou word, ’n tent waar God gewoon het, ’n blik op heerlikheid, reuse in die land en ’n slang op ’n paal." },
      memoryVerse: v("My Presence will go with you, and I will give you rest.", "Exodus 33:14", "Ek self sal saam met jou gaan, en Ek sal jou rus gee.", "Eksodus 33:14"),
      nights: [
        story("j03-n08", "day desert rock ; 💧80,150,26 🧔180,166,36 🪄210,140,26", t("Patient", "Geduldig", "God is patient even when we grumble", "God is geduldig selfs as ons kla")),
        story("j03-n09", "day hills ; 🧔200,120,34 🙌200,90,28 🪨200,160,26 👴150,140,26 👴250,140,26", t("Together", "Saam", "God gives friends to hold me up", "God gee vriende om my op te hou")),
        story("j03-n10", "day desert ; ⛺200,150,54 ☁️200,70,40 🔥320,140,26", t("Lives With Us", "Woon by Ons", "God wants to live among His people", "God wil tussen sy mense woon")),
        story("j03-n11", "dawn mountain rock ; ✨200,60,34 🧔90,150,30", t("Glory", "Heerlikheid", "God’s presence goes with me", "God se teenwoordigheid gaan saam met my")),
        story("j03-n12", "day hills ; 🍇120,160,36 🧌280,150,50 🧔180,166,30", t("Wholehearted", "Met My Hele Hart", "God’s promises are bigger than giants", "God se beloftes is groter as reuse")),
        story("j03-n13", "day desert ; 🐍200,90,34 🪵200,140,40 👀280,166,28", t("Look and Live", "Kyk en Lewe", "When I look to Jesus, I am saved", "As ek na Jesus kyk, word ek gered")),
        camp("j03-n14", "night campfire ; 🔥200,165,54 ⛺320,162,40"),
      ],
    },
    {
      id: "j03-e3", color: 2,
      title: { en: "Friends and Kings", af: "Vriende en Konings" },
      blurb: { en: "A red rope in a window, stones by a river, a family choice, two loyal friends, a cave of mercy and a seat at the king’s table.", af: "’n Rooi tou in ’n venster, klippe by ’n rivier, ’n familiekeuse, twee lojale vriende, ’n grot van genade en ’n plek aan die koning se tafel." },
      memoryVerse: v("As for me and my household, we will serve the Lord.", "Joshua 24:15", "Ek en my huis, ons sal die Here dien.", "Josua 24:15"),
      nights: [
        story("j03-n15", "sunset town walls ; 🪢250,100,30 👩200,166,34", t("Rescuer", "Redder", "God rescues anyone who trusts Him", "God red enigiemand wat Hom vertrou")),
        story("j03-n16", "day river ; 🪨150,166,26 🪨180,168,24 🪨210,166,26 🧒260,166,32", t("Remember", "Onthou", "I remember what God has done", "Ek onthou wat God gedoen het")),
        story("j03-n17", "day hills ; 👴150,166,36 👨‍👩‍👧‍👦240,166,40", t("Choose", "Kies", "I choose to serve the Lord", "Ek kies om die Here te dien")),
        story("j03-n18", "day hills ; 🏹140,150,30 🤝200,160,34 👦260,166,30", t("True Friend", "Ware Vriend", "God gives true friends", "God gee ware vriende")),
        story("j03-n19", "night cave ; 🗡️170,160,26 👑230,160,26", t("Mercy", "Genade", "God helps me choose mercy, not revenge", "God help my om genade te kies, nie wraak nie")),
        story("j03-n20", "day town ; 👑150,140,28 🍞200,166,26 🧑‍🦯250,166,32", t("Kindness", "Goedheid", "God invites me to His table", "God nooi my na sy tafel")),
        camp("j03-n21", "night campfire ; 🔥200,165,54 👑320,166,34"),
      ],
    },
    {
      id: "j03-e4", color: 7,
      title: { en: "Songs and Prophets", af: "Liedere en Profete" },
      blurb: { en: "A king dancing with joy, a heart made clean, four brave teenagers, a vision of the throne, a potter’s wheel and a valley of dry bones.", af: "’n Koning wat van vreugde dans, ’n hart wat rein gemaak word, vier dapper tieners, ’n visioen van die troon, ’n pottebakkerswiel en ’n vallei van droë bene." },
      memoryVerse: v("Create in me a pure heart, O God, and renew a steadfast spirit within me.", "Psalm 51:10", "Skep vir my ’n rein hart, o God, en gee my ’n nuwe, standvastige gees.", "Psalm 51:12"),
      nights: [
        story("j03-n22", "day town ; 💃200,160,40 🎺120,150,28 📦290,160,32", t("Joyful Worship", "Blye Aanbidding", "I can worship God with all my heart", "Ek kan God met my hele hart aanbid")),
        story("j03-n23", "night town ; 🧔180,166,36 💧220,150,20 🤍260,120,26", t("Clean Heart", "Rein Hart", "God forgives me when I’m truly sorry", "God vergewe my as ek regtig jammer is")),
        story("j03-n24", "day town ; 🥦150,166,28 💧200,166,26 👦260,166,32", t("Set Apart", "Afgesonder", "I can choose God’s way even when it’s different", "Ek kan God se pad kies selfs as dit anders is")),
        story("j03-n25", "sunset town ; 👑200,80,40 🔥140,110,26 🙋260,166,32", t("Holy", "Heilig", "God is holy, and He sends me", "God is heilig, en Hy stuur my")),
        story("j03-n26", "day town ; 🏺200,150,40 🧑‍🔧130,166,34 👦280,166,30", t("Potter", "Pottebakker", "God shapes me, even while I’m young", "God vorm my, selfs terwyl ek jonk is")),
        story("j03-n27", "dawn desert ; 🦴130,170,24 🦴180,172,22 🌬️260,90,34", t("New Life", "Nuwe Lewe", "God’s Spirit brings dead things to life", "God se Gees maak dooie dinge lewendig")),
        camp("j03-n28", "night campfire ; 🔥200,165,54 🎵320,150,30"),
      ],
    },
    {
      id: "j03-e5", color: 3,
      title: { en: "Stories Jesus Told", af: "Stories wat Jesus Vertel Het" },
      blurb: { en: "Seeds on four kinds of ground, a tiny mustard seed, a treasure in a field, a servant who would not forgive, a widow who kept knocking and two men praying.", af: "Saad op vier soorte grond, ’n klein mosterdsaadjie, ’n skat in ’n land, ’n slaaf wat nie wou vergewe nie, ’n weduwee wat aangehou klop het en twee mans wat bid." },
      memoryVerse: v("Blessed are those who hear the word of God and obey it.", "Luke 11:28", "Gelukkig is die wat die woord van God hoor en dit gehoorsaam.", "Lukas 11:28"),
      nights: [
        story("j03-n29", "day hills ; 🧑‍🌾120,166,36 🌱220,170,24 🐦300,100,24", t("Good Soil", "Goeie Grond", "I want God’s Word to grow in my heart", "Ek wil hê God se Woord moet in my hart groei")),
        story("j03-n30", "day garden tree ; 🐦290,60,22 🐦330,74,20 🌱120,170,20", t("Small Beginnings", "Klein Begin", "God’s kingdom grows from small things", "God se koninkryk groei uit klein dingetjies")),
        story("j03-n31", "day hills ; 💎200,160,30 🪙250,166,22 🧑‍🌾130,166,34", t("Treasure", "Skat", "Knowing Jesus is worth more than anything", "Om Jesus te ken, is meer werd as enigiets")),
        story("j03-n32", "day town ; 👑140,140,28 🧔200,166,34 🧔270,166,34", t("Forgive", "Vergewe", "Because I’m forgiven, I forgive", "Omdat ek vergewe is, vergewe ek")),
        story("j03-n33", "day town ; 👵170,166,34 🚪240,150,40 ⚖️300,140,26", t("Keep Praying", "Hou Aan Bid", "God wants me to keep praying", "God wil hê ek moet aanhou bid")),
        story("j03-n34", "day town walls ; 🧔150,166,34 🙇250,166,32", t("Humble", "Nederig", "God welcomes humble hearts", "God verwelkom nederige harte")),
        camp("j03-n35", "night campfire ; 🔥200,165,54 🌱320,168,30"),
      ],
    },
    {
      id: "j03-e6", color: 5,
      title: { en: "Eyes Wide Open", af: "Oë Wyd Oop" },
      blurb: { en: "A man under a fig tree, a pool where no one helped, a blind man who saw, a mountaintop of light, a walk to Emmaus and a doubter who believed.", af: "’n Man onder ’n vyeboom, ’n bad waar niemand gehelp het nie, ’n blinde man wat kon sien, ’n bergtop van lig, ’n wandeling na Emmaus en ’n twyfelaar wat geglo het." },
      memoryVerse: v("One thing I do know. I was blind but now I see!", "John 9:25", "Een ding weet ek: ek was blind, en nou kan ek sien!", "Johannes 9:25"),
      nights: [
        story("j03-n36", "day hills tree ; 🧔300,166,30 🧑140,166,34", t("Known", "Geken", "Jesus knows me before I come to Him", "Jesus ken my voordat ek na Hom kom")),
        story("j03-n37", "day town ; 💧200,166,40 🧑‍🦽140,166,32 🧔270,166,34", t("Get Up", "Staan Op", "Jesus meets me when I feel stuck", "Jesus ontmoet my as ek vasgevang voel")),
        story("j03-n38", "day town ; 👀200,120,30 🧑‍🦯150,166,34 💧260,166,24", t("Light of the World", "Lig vir die Wêreld", "Jesus opens my eyes", "Jesus maak my oë oop")),
        story("j03-n39", "day mountain ; ✨200,40,40 ☁️200,80,40 🧔120,160,26 🧔280,160,26", t("Beloved Son", "Geliefde Seun", "Jesus is God’s beloved Son; I listen to Him", "Jesus is God se geliefde Seun; ek luister na Hom")),
        story("j03-n40", "sunset hills ; 🧔130,166,32 🧔190,166,32 🍞280,160,26", t("Burning Heart", "Brandende Hart", "Jesus walks with me and opens His Word", "Jesus loop saam met my en maak sy Woord oop")),
        story("j03-n41", "night town ; 🖐️200,120,34 🧔260,166,34", t("My Lord and My God", "My Here en my God", "Jesus meets my doubts with love", "Jesus ontmoet my twyfel met liefde")),
        camp("j03-n42", "night campfire ; 🔥200,165,54 👀320,150,30"),
      ],
    },
    {
      id: "j03-e7", color: 6,
      title: { en: "Running the Race", af: "Die Wedloop Hardloop" },
      blurb: { en: "A businesswoman by a river, a sermon to clever thinkers, a shipwreck in a storm, a faith passed down three generations, a tiny tongue and a great finish line.", af: "’n Sakevrou by ’n rivier, ’n preek vir slim denkers, ’n skipbreuk in ’n storm, geloof wat drie geslagte oorgedra is, ’n klein tongetjie en ’n groot eindstreep." },
      memoryVerse: v("Let us run with perseverance the race marked out for us, fixing our eyes on Jesus.", "Hebrews 12:1–2", "Laat ons met volharding die wedloop hardloop wat voor ons lê, met ons oë op Jesus gerig.", "Hebreërs 12:1–2"),
      nights: [
        story("j03-n43", "day river ; 👩150,166,34 🟣210,160,26 🧔270,166,32", t("Open Heart", "Oop Hart", "God opens hearts to hear His Word", "God maak harte oop om sy Woord te hoor")),
        story("j03-n44", "day town ; 🏛️200,120,60 🧔200,166,30", t("Close to All", "Naby Almal", "God is close to everyone who seeks Him", "God is naby almal wat Hom soek")),
        story("j03-n45", "storm sea ; ⛵200,120,40 ⚓280,150,26", t("Anchor", "Anker", "God is my anchor in every storm", "God is my anker in elke storm")),
        story("j03-n46", "day town ; 👵130,166,32 👩190,166,32 👦250,166,30 📜310,160,26", t("Faith Passed On", "Geloof Oorgedra", "God’s Word makes me wise and ready", "God se Woord maak my wys en gereed")),
        story("j03-n47", "day town ; 👅200,140,30 🔥140,160,24 🌳290,150,40", t("Kind Words", "Gawe Woorde", "God helps me use my words to bless", "God help my om my woorde te gebruik om te seën")),
        camp("j03-n48", "night campfire star ; 🔥200,165,54 🏁80,160,40 🏃320,166,36", "finale"),
      ],
    },
  ],
};
