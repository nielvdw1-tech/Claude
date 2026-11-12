/**
 * Journey Trail 1, Expedition 1 (The Maker's Garden): ages 2–3 and 8–9, English and Afrikaans.
 * Merged into public/content/journey-01.json by scripts/convert-prototypes.mjs.
 * Status: DRAFT, awaiting review (see docs/CONTENT-GUIDE.md section 7).
 */
const simple = (text, refText) => ({ text, refText, wording: "simple" });
const toddler = (o) => ({ prayerStyle: "repeat", ...o });
const older = (o) => ({ prayerStyle: "own", ...o });

export default {
  /* ---------------- Night 1: Creation ---------------- */
  "j01-n01": {
    "2-3": {
      en: toddler({
        title: "God Made Everything", bibleStory: "Genesis 1",
        story: ["A long, long time ago there was nothing at all. Only God.", "God spoke, and the light came on! Whoosh!", "God made the sky so blue and the sea so big. He made the sun for the day and the stars for the night.", "God made fish that swim, birds that fly and lions that ROAR!", "God looked at everything and smiled. ‘It is very good!’"],
        verse: simple("God made everything.", "Genesis 1:1"),
        action: "Make a big circle with your arms for the whole world. Then flap like a bird, swim like a fish and roar like a lion!",
        lessons: ["God made everything, and He made it good."],
        questions: ["Can you point to something God made?"],
        prayer: ["Thank you, God,", "for making everything. Amen."],
      }),
      af: toddler({
        title: "God Het Alles Gemaak", bibleStory: "Genesis 1",
        story: ["Lank, lank gelede was daar niks nie. Net God.", "God het gepraat, en die lig het aangegaan! Woesj!", "God het die lug so blou gemaak en die see so groot. Hy het die son vir die dag gemaak en die sterre vir die nag.", "God het visse gemaak wat swem, voëls wat vlieg en leeus wat BRUL!", "God het na alles gekyk en geglimlag. ‘Dit is baie goed!’"],
        verse: simple("God het alles gemaak.", "Genesis 1:1"),
        action: "Maak ’n groot sirkel met jou arms vir die hele wêreld. Klap dan jou vlerke soos ’n voël, swem soos ’n vis en brul soos ’n leeu!",
        lessons: ["God het alles gemaak, en Hy het dit goed gemaak."],
        questions: ["Kan jy wys na iets wat God gemaak het?"],
        prayer: ["Dankie, God,", "dat U alles gemaak het. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "In the Beginning", bibleStory: "Genesis 1", readPassage: "Genesis 1:1–5 and 1:26–31",
        story: [
          "Before there was a single atom in the universe, before time even started ticking, there was God. Nobody made God. He has always been there: Father, Son and Holy Spirit, perfectly happy together.",
          "Then God decided to create. Genesis says, ‘God said, “Let there be light,” and there was light.’ Notice what God used to build the universe: words. He didn’t need tools or materials. He simply spoke, and things that did not exist came into being. Light. Sky. Oceans. Dry land. Plants with seeds inside them, so they could make more plants.",
          "On day four God placed the sun, the moon and billions of stars in the sky. On day five He filled the seas with fish and the air with birds. On day six He made animals of every kind, from elephants to earthworms. Scientists are still discovering creatures God made that nobody has ever seen before.",
          "Then God did something different. He made people, and He made them ‘in His image’. That means people are like God in a special way: we can think, create, love, choose and talk with Him. No other creature was made like that. God made people to be His children and to look after His world with Him.",
          "At the end of the sixth day God looked at everything He had made and said it was ‘very good’. On the seventh day He rested, not because He was tired, but to enjoy what He had made.",
          "Here is the amazing part: the same voice that spoke the stars into being still speaks today. God speaks through the Bible, and by His Spirit He speaks to the hearts of His children. The God who made the universe wants to talk with you.",
        ],
        verse: { text: "In the beginning God created the heavens and the earth.", refText: "Genesis 1:1", wording: "bsb" },
        lessons: ["God is the Creator. Everything that exists, He made, and He made it good.", "God made people in His image, to be His children and to know Him.", "God’s words are powerful. The voice that created the world still speaks today."],
        questions: ["What did God use to create the world? Why is that amazing?", "What does it mean that you are made ‘in God’s image’?", "Where did you see something God made today? What does it tell you about Him?"],
        listen: "Sit quietly for one minute. Think about something beautiful God made. Ask Him: ‘God, what do you want me to know about you tonight?’ If a kind thought comes, write it down or tell your parent. God’s voice always agrees with the Bible and sounds like love.",
        prayer: ["God, you are the Creator of everything.", "Thank you for making me in your image.", "Tonight I want to thank you for…"],
        mission: { compass: "talk", text: "Go on a ‘creation hunt’ tomorrow: find five things God made and thank Him for each one." },
        journal: "Draw or write about your favourite part of creation. What does it show you about what God is like?",
      }),
      af: older({
        title: "In die Begin", bibleStory: "Genesis 1", readPassage: "Genesis 1:1–5 en 1:26–31",
        story: [
          "Voordat daar ’n enkele atoom in die heelal was, voordat tyd selfs begin tik het, was daar God. Niemand het God gemaak nie. Hy was nog altyd daar: Vader, Seun en Heilige Gees, volkome gelukkig saam.",
          "Toe het God besluit om te skep. Genesis sê: ‘God het gesê: “Laat daar lig wees!” En daar was lig.’ Let op wat God gebruik het om die heelal te bou: woorde. Hy het nie gereedskap of materiaal nodig gehad nie. Hy het net gepraat, en dinge wat nie bestaan het nie, het ontstaan. Lig. Lug. Oseane. Droë grond. Plante met sade in, sodat hulle meer plante kon maak.",
          "Op dag vier het God die son, die maan en biljoene sterre in die hemel gesit. Op dag vyf het Hy die see vol visse en die lug vol voëls gemaak. Op dag ses het Hy allerhande diere gemaak, van olifante tot erdwurms. Wetenskaplikes ontdek steeds diere wat God gemaak het wat nog niemand ooit gesien het nie.",
          "Toe het God iets anders gedoen. Hy het mense gemaak, en Hy het hulle ‘na sy beeld’ gemaak. Dit beteken mense is op ’n spesiale manier soos God: ons kan dink, skep, liefhê, kies en met Hom praat. Geen ander skepsel is so gemaak nie. God het mense gemaak om sy kinders te wees en saam met Hom na sy wêreld om te sien.",
          "Aan die einde van die sesde dag het God na alles gekyk wat Hy gemaak het en gesê dit is ‘baie goed’. Op die sewende dag het Hy gerus, nie omdat Hy moeg was nie, maar om te geniet wat Hy gemaak het.",
          "Hier is die wonderlike deel: dieselfde stem wat die sterre laat ontstaan het, praat vandag nog. God praat deur die Bybel, en deur sy Gees praat Hy met die harte van sy kinders. Die God wat die heelal gemaak het, wil met jou praat.",
        ],
        verse: simple("In die begin het God die hemel en die aarde geskep.", "Genesis 1:1"),
        lessons: ["God is die Skepper. Alles wat bestaan, het Hy gemaak, en Hy het dit goed gemaak.", "God het mense na sy beeld gemaak, om sy kinders te wees en Hom te ken.", "God se woorde is kragtig. Die stem wat die wêreld geskep het, praat vandag nog."],
        questions: ["Wat het God gebruik om die wêreld te skep? Hoekom is dit wonderlik?", "Wat beteken dit dat jy ‘na God se beeld’ gemaak is?", "Waar het jy vandag iets gesien wat God gemaak het? Wat sê dit vir jou oor Hom?"],
        listen: "Sit een minuut lank stil. Dink aan iets moois wat God gemaak het. Vra Hom: ‘God, wat wil U hê moet ek vanaand oor U weet?’ As ’n liefdevolle gedagte kom, skryf dit neer of vertel jou ouer. God se stem stem altyd ooreen met die Bybel en klink na liefde.",
        prayer: ["God, U is die Skepper van alles.", "Dankie dat U my na u beeld gemaak het.", "Vanaand wil ek U dankie sê vir…"],
        mission: { compass: "talk", text: "Gaan môre op ’n ‘skeppingsjag’: soek vyf dinge wat God gemaak het en sê vir elkeen dankie." },
        journal: "Teken of skryf oor jou gunstelingdeel van die skepping. Wat wys dit vir jou oor hoe God is?",
      }),
    },
  },

  /* ---------------- Night 2: Made in God's image ---------------- */
  "j01-n02": {
    "2-3": {
      en: toddler({
        title: "God Made Me", bibleStory: "Genesis 2",
        story: ["God made the trees and the flowers and the animals.", "Then God made people. He made them like Him, so they could love and laugh and be His children.", "And God made YOU! He made your eyes, your nose and your toes. Wiggle them!", "God loves you so much. You are His child."],
        verse: simple("God made me wonderful.", "Psalm 139:14"),
        action: "Touch your eyes, your nose and your toes, and say: ‘God made me!’",
        lessons: ["God made me, and He loves me. I am His child."],
        questions: ["What did God give you? Can you show me your hands?"],
        prayer: ["Thank you, God,", "for making me. I love you. Amen."],
      }),
      af: toddler({
        title: "God Het My Gemaak", bibleStory: "Genesis 2",
        story: ["God het die bome en die blomme en die diere gemaak.", "Toe het God mense gemaak. Hy het hulle soos Hy gemaak, sodat hulle kon liefhê en lag en sy kinders kon wees.", "En God het JOU gemaak! Hy het jou oë, jou neus en jou tone gemaak. Wikkel hulle!", "God is so lief vir jou. Jy is sy kind."],
        verse: simple("God het my wonderlik gemaak.", "Psalm 139:14"),
        action: "Raak aan jou oë, jou neus en jou tone, en sê: ‘God het my gemaak!’",
        lessons: ["God het my gemaak, en Hy is lief vir my. Ek is sy kind."],
        questions: ["Wat het God vir jou gegee? Kan jy vir my jou hande wys?"],
        prayer: ["Dankie, God,", "dat U my gemaak het. Ek is lief vir U. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Knitted Together", bibleStory: "Genesis 2, Psalm 139", readPassage: "Genesis 2:7–8, 15–22 and Psalm 139:13–16",
        story: [
          "Genesis 2 zooms in on day six and shows us how God made the first man. God took dust from the ground and formed it, the way a potter shapes clay. Then God breathed into the man’s nostrils, and Adam became a living person. Every breath you take tonight is a gift from that same God.",
          "God planted a garden in Eden and put Adam there to look after it. Adam named all the animals. That was a big job, and it shows that God trusted people with real responsibility. But among all the animals there was no one like Adam. So God made Eve, the first woman, and brought her to Adam. Now there were people to share life with.",
          "Hundreds of years later King David thought about how God makes every person. He wrote Psalm 139: ‘You created my inmost being; you knit me together in my mother’s womb.’ Knitting is slow, careful work. David was saying that God made him on purpose, stitch by stitch.",
          "That is true of you too. God chose the colour of your eyes, the sound of your laugh and the things you are good at. He knew you before you were born, and He wrote down all your days. There has never been another you, and there never will be.",
          "Being made by God means you belong to Him. You are not an accident, and you don’t have to earn your worth. God made you to be His child, and He delights in you.",
        ],
        verse: simple("I praise you because you made me in an amazing and wonderful way.", "Psalm 139:14"),
        lessons: ["God made every person on purpose, carefully and lovingly.", "God made people to be His children and gave them important work to do.", "My worth comes from the God who made me, not from what I do or what others think."],
        questions: ["How did God make Adam? What did He breathe into him?", "Why do you think David compared God’s work to knitting?", "When do you feel ‘not good enough’? What does Psalm 139 say to you then?"],
        listen: "Be still for one minute. Ask God: ‘What do you think about me?’ Listen. God’s words to you will always be kind and true, like the words of Psalm 139.",
        prayer: ["Father, thank you for making me on purpose.", "Help me to believe what you say about me.", "Thank you that I am your child."],
        mission: { compass: "love", text: "God made every person carefully. Tomorrow, tell three people something you appreciate about them." },
        journal: "Write ‘God made me’ in the middle of a page. Around it, write or draw ten things God gave you.",
      }),
      af: older({
        title: "Saamgebrei", bibleStory: "Genesis 2, Psalm 139", readPassage: "Genesis 2:7–8, 15–22 en Psalm 139:13–16",
        story: [
          "Genesis 2 zoem in op dag ses en wys ons hoe God die eerste man gemaak het. God het stof van die grond geneem en dit gevorm, soos ’n pottebakker klei vorm. Toe het God in die man se neus geblaas, en Adam het ’n lewende mens geword. Elke asem wat jy vanaand haal, is ’n geskenk van daardie selfde God.",
          "God het ’n tuin in Eden geplant en Adam daar gesit om dit op te pas. Adam het al die diere name gegee. Dit was ’n groot werk, en dit wys dat God mense met regte verantwoordelikheid vertrou het. Maar tussen al die diere was daar niemand soos Adam nie. Toe het God Eva gemaak, die eerste vrou, en haar na Adam gebring. Nou was daar mense om die lewe mee te deel.",
          "Honderde jare later het koning Dawid gedink oor hoe God elke mens maak. Hy het Psalm 139 geskryf: ‘U het my binneste gevorm; U het my in my ma se skoot saamgebrei.’ Brei is stadige, versigtige werk. Dawid het gesê dat God hom met ’n doel gemaak het, steek vir steek.",
          "Dit is ook waar van jou. God het die kleur van jou oë gekies, die klank van jou lag en die dinge waarin jy goed is. Hy het jou geken voordat jy gebore is, en Hy het al jou dae neergeskryf. Daar was nog nooit ’n ander jy nie, en daar sal ook nooit wees nie.",
          "Omdat God jou gemaak het, behoort jy aan Hom. Jy is nie ’n ongeluk nie, en jy hoef nie jou waarde te verdien nie. God het jou gemaak om sy kind te wees, en Hy het vreugde in jou.",
        ],
        verse: simple("Ek loof U, want U het my wonderlik en mooi gemaak.", "Psalm 139:14"),
        lessons: ["God het elke mens met ’n doel gemaak, versigtig en liefdevol.", "God het mense gemaak om sy kinders te wees en het hulle belangrike werk gegee.", "My waarde kom van die God wat my gemaak het, nie van wat ek doen of wat ander dink nie."],
        questions: ["Hoe het God Adam gemaak? Wat het Hy in hom geblaas?", "Hoekom dink jy het Dawid God se werk met brei vergelyk?", "Wanneer voel jy ‘nie goed genoeg nie’? Wat sê Psalm 139 dan vir jou?"],
        listen: "Wees een minuut lank stil. Vra God: ‘Wat dink U van my?’ Luister. God se woorde vir jou sal altyd liefdevol en waar wees, soos die woorde van Psalm 139.",
        prayer: ["Vader, dankie dat U my met ’n doel gemaak het.", "Help my om te glo wat U oor my sê.", "Dankie dat ek u kind is."],
        mission: { compass: "love", text: "God het elke mens versigtig gemaak. Sê môre vir drie mense iets wat jy in hulle waardeer." },
        journal: "Skryf ‘God het my gemaak’ in die middel van ’n bladsy. Skryf of teken rondom dit tien dinge wat God vir jou gegee het.",
      }),
    },
  },

  /* ---------------- Night 3: The fall and the first promise ---------------- */
  "j01-n03": {
    "2-3": {
      en: toddler({
        title: "Where Are You?", bibleStory: "Genesis 3",
        story: ["God made a beautiful garden for Adam and Eve.", "God said, ‘Don’t eat from that one tree.’ But they did. Oh no!", "They felt sad, and they hid behind a bush.", "But God came looking. ‘Where are you?’ God still loved them.", "And God made a promise: one day He would send Jesus to make everything right."],
        verse: simple("God called, ‘Where are you?’", "Genesis 3:9"),
        action: "Play peekaboo! Hide behind your hands, then pop out: ‘Here I am!’ God always comes looking for us.",
        lessons: ["When I do wrong, God still loves me. I can say sorry."],
        questions: ["What can we say when we do something wrong? (Sorry!)"],
        prayer: ["Dear God,", "thank you that you always find me. Amen."],
      }),
      af: toddler({
        title: "Waar Is Jy?", bibleStory: "Genesis 3",
        story: ["God het ’n pragtige tuin vir Adam en Eva gemaak.", "God het gesê: ‘Moenie van daardie een boom eet nie.’ Maar hulle het. O nee!", "Hulle was hartseer, en hulle het agter ’n bos weggekruip.", "Maar God het kom soek. ‘Waar is jy?’ God was nog steeds lief vir hulle.", "En God het ’n belofte gemaak: eendag sou Hy Jesus stuur om alles reg te maak."],
        verse: simple("God het geroep: ‘Waar is jy?’", "Genesis 3:9"),
        action: "Speel kiekeboe! Kruip agter jou hande weg, en spring dan uit: ‘Hier is ek!’ God kom altyd na ons soek.",
        lessons: ["As ek iets verkeerd doen, is God nog steeds lief vir my. Ek kan jammer sê."],
        questions: ["Wat kan ons sê as ons iets verkeerd gedoen het? (Jammer!)"],
        prayer: ["Liewe God,", "dankie dat U my altyd kry. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "The Hiding and the Seeking", bibleStory: "Genesis 3", readPassage: "Genesis 3:1–15",
        story: [
          "Life in the garden was perfect. Adam and Eve walked with God, talked with Him and had everything they needed. God had given them one rule: don’t eat from the tree of the knowledge of good and evil. If they did, He warned, they would die.",
          "One day the serpent (the Bible later tells us this was Satan) asked Eve a sneaky question: ‘Did God really say…?’ Then he told a lie: ‘You won’t die. God just doesn’t want you to be like Him.’ The lie made God sound mean and unfair. Eve looked at the fruit, took some and ate it. Adam ate it too.",
          "Immediately everything changed. For the first time they felt shame. They sewed fig leaves together to cover themselves, and when they heard God walking in the garden, they hid among the trees.",
          "This is what the Bible calls sin: choosing our own way instead of God’s way. Sin brought death into the world: our bodies would one day die, and people were cut off from God. From that day on, every person has been born with a heart that leans toward sin. That is why nobody has to teach a toddler to grab or to shout ‘Mine!’",
          "But look what God did next. He came looking. ‘Where are you?’ He already knew where they were. He was inviting them to come out of hiding. There were consequences, and life outside the garden would be hard. But God also made a promise. Genesis 3:15 says one of Eve’s descendants would crush the serpent’s head. This is the very first promise in the Bible about Jesus, who would one day defeat sin and Satan on the cross.",
          "When you do something wrong, you might want to hide too. But God is still the One who comes looking. Because of Jesus, you can come out of hiding, tell God the truth and be forgiven.",
        ],
        verse: simple("But the Lord God called to the man, ‘Where are you?’", "Genesis 3:9"),
        lessons: ["Sin is choosing our own way instead of God’s way, and every person has sin in their heart.", "Sin makes us want to hide from God, but God comes looking for us.", "From the very beginning, God promised a Rescuer: Jesus."],
        questions: ["What lie did the serpent tell about God?", "Why did Adam and Eve hide? Why did God call out to them?", "What do you usually do when you’ve done something wrong? What could you do instead?"],
        listen: "Be quiet for one minute. Ask God: ‘Is there anything I need to bring out of hiding?’ If something comes to mind, tell God about it and say sorry. Then listen again: what does He say to you? (Hint: read 1 John 1:9.)",
        prayer: ["God, thank you that you came looking for Adam and Eve, and you come looking for me.", "I’m sorry for…", "Thank you for Jesus, the Rescuer you promised."],
        mission: { compass: "talk", text: "If you get something wrong tomorrow, don’t hide it. Tell God and the person, and say sorry." },
        journal: "Write Genesis 3:15 in your own words. Why do you think God made this promise on the same day Adam and Eve sinned?",
      }),
      af: older({
        title: "Wegkruip en Soek", bibleStory: "Genesis 3", readPassage: "Genesis 3:1–15",
        story: [
          "Die lewe in die tuin was volmaak. Adam en Eva het saam met God gewandel, met Hom gepraat en alles gehad wat hulle nodig gehad het. God het hulle een reël gegee: moenie van die boom van die kennis van goed en kwaad eet nie. As hulle dit doen, het Hy gewaarsku, sal hulle sterf.",
          "Eendag het die slang (die Bybel vertel ons later dat dit Satan was) vir Eva ’n skelm vraag gevra: ‘Het God regtig gesê…?’ Toe het hy ’n leuen vertel: ‘Julle sal nie sterf nie. God wil net nie hê julle moet soos Hy wees nie.’ Die leuen het God gemeen en onregverdig laat klink. Eva het na die vrug gekyk, daarvan gevat en geëet. Adam het ook geëet.",
          "Dadelik het alles verander. Vir die eerste keer het hulle skaam gevoel. Hulle het vyeblare aanmekaargewerk om hulself te bedek, en toe hulle God in die tuin hoor loop, het hulle tussen die bome weggekruip.",
          "Dit is wat die Bybel sonde noem: om ons eie pad te kies in plaas van God se pad. Sonde het die dood in die wêreld gebring: ons liggame sou eendag sterf, en mense is van God afgesny. Van daardie dag af word elke mens gebore met ’n hart wat na sonde toe neig. Dit is hoekom niemand ’n kleuter hoef te leer om te gryp of ‘Myne!’ te skree nie.",
          "Maar kyk wat God toe gedoen het. Hy het kom soek. ‘Waar is jy?’ Hy het klaar geweet waar hulle was. Hy het hulle uitgenooi om uit hulle wegkruipplek te kom. Daar was gevolge, en die lewe buite die tuin sou moeilik wees. Maar God het ook ’n belofte gemaak. Genesis 3:15 sê een van Eva se nakomelinge sal die slang se kop vermorsel. Dit is die heel eerste belofte in die Bybel oor Jesus, wat eendag sonde en Satan aan die kruis sou oorwin.",
          "As jy iets verkeerd doen, wil jy dalk ook wegkruip. Maar God is steeds die Een wat kom soek. Danksy Jesus kan jy uit jou wegkruipplek kom, die waarheid vir God vertel en vergewe word.",
        ],
        verse: simple("Maar die Here God het na die man geroep: ‘Waar is jy?’", "Genesis 3:9"),
        lessons: ["Sonde is om ons eie pad te kies in plaas van God se pad, en elke mens het sonde in sy of haar hart.", "Sonde laat ons van God wil wegkruip, maar God kom soek na ons.", "Van die heel begin af het God ’n Redder belowe: Jesus."],
        questions: ["Watter leuen het die slang oor God vertel?", "Hoekom het Adam en Eva weggekruip? Hoekom het God na hulle geroep?", "Wat doen jy gewoonlik as jy iets verkeerd gedoen het? Wat kan jy eerder doen?"],
        listen: "Wees een minuut lank stil. Vra God: ‘Is daar iets wat ek uit my wegkruipplek moet bring?’ As iets opkom, vertel God daarvan en sê jammer. Luister dan weer: wat sê Hy vir jou? (Wenk: lees 1 Johannes 1:9.)",
        prayer: ["God, dankie dat U na Adam en Eva kom soek het, en dat U na my kom soek.", "Ek is jammer vir…", "Dankie vir Jesus, die Redder wat U belowe het."],
        mission: { compass: "talk", text: "As jy môre iets verkeerd doen, moenie dit wegsteek nie. Vertel God en die persoon, en sê jammer." },
        journal: "Skryf Genesis 3:15 in jou eie woorde. Hoekom dink jy het God hierdie belofte gemaak op dieselfde dag wat Adam en Eva gesondig het?",
      }),
    },
  },

  /* ---------------- Night 4: Noah ---------------- */
  "j01-n04": {
    "2-3": {
      en: toddler({
        title: "Noah’s Big Boat", bibleStory: "Genesis 6 – 9",
        story: ["Noah loved God.", "God said, ‘Build a big, big boat!’ Bang, bang, bang went Noah’s hammer.", "Then the animals came, two by two. Elephants, giraffes, and little ducks too!", "Pitter-patter, the rain came down. But Noah and the animals were safe inside.", "Then God put a rainbow in the sky. ‘I always keep my promises,’ said God."],
        verse: simple("God keeps His promises.", "Genesis 9:13"),
        action: "Bang a hammer with your fist, make pitter-patter rain with your fingers, then draw a big rainbow in the air.",
        lessons: ["God always keeps His promises."],
        questions: ["Which animal would you take on the boat? What sound does it make?"],
        prayer: ["Thank you, God,", "that you keep me safe. Amen."],
      }),
      af: toddler({
        title: "Noag se Groot Boot", bibleStory: "Genesis 6 – 9",
        story: ["Noag was lief vir God.", "God het gesê: ‘Bou ’n groot, groot boot!’ Klop, klop, klop het Noag se hamer gegaan.", "Toe het die diere gekom, twee-twee. Olifante, kameelperde, en klein eendjies ook!", "Tik-tik-tik het die reën geval. Maar Noag en die diere was veilig binne-in.", "Toe het God ’n reënboog in die lug gesit. ‘Ek hou altyd my beloftes,’ het God gesê."],
        verse: simple("God hou sy beloftes.", "Genesis 9:13"),
        action: "Kap ’n hamer met jou vuis, maak tik-tik-reën met jou vingers, en teken dan ’n groot reënboog in die lug.",
        lessons: ["God hou altyd sy beloftes."],
        questions: ["Watter dier sou jy op die boot saamneem? Watter geluid maak dit?"],
        prayer: ["Dankie, God,", "dat U my veilig hou. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "The Ark and the Rainbow", bibleStory: "Genesis 6 – 9", readPassage: "Genesis 6:5–22 and 9:8–17",
        story: [
          "By Noah’s time the world had become a terrible place. The Bible says people’s thoughts were ‘only evil all the time’. Violence was everywhere. It grieved God, which means it hurt His heart, that the people He had made had turned so far from Him.",
          "But Noah ‘found favour in the eyes of the Lord’. Noah walked with God. So God told Noah His plan: a flood would cover the earth, but Noah, his family and two of every kind of animal would be kept safe in an enormous boat called an ark. God gave exact measurements: about 135 metres long, 22 metres wide and 13 metres high.",
          "The Bible says, ‘Noah did everything just as God commanded him.’ Building the ark took years. There was no rain in sight, and people must have thought Noah had lost his mind. But Noah trusted what God said more than what he could see. That is what faith is.",
          "When the flood came, it rained for forty days and forty nights, and the water covered even the mountains. But inside the ark everyone was safe. God Himself had shut the door.",
          "When the water finally went down and Noah stepped onto dry ground, the first thing he did was build an altar and worship God. Then God made a covenant, a solemn promise, with Noah and with every living creature: never again would a flood destroy the whole earth. The sign of the promise was the rainbow.",
          "God takes sin seriously, because it destroys the people He loves. But God always makes a way of rescue too. The ark is a picture of Jesus: everyone who is in Him is safe.",
        ],
        verse: simple("I have put my rainbow in the clouds. It is the sign of my promise.", "Genesis 9:13"),
        lessons: ["God takes sin seriously because He loves people and sin destroys them.", "Faith means trusting what God says even when you can’t see it yet.", "God always keeps His promises, and He always makes a way of rescue."],
        questions: ["How long did Noah work on the ark? What do you think people said to him?", "How is the ark like Jesus?", "Is there something God has promised that you find hard to believe right now?"],
        listen: "Sit still and picture a rainbow. Ask God: ‘Which of your promises do you want me to remember this week?’ Write down anything that comes to mind, and check it in the Bible with your parent.",
        prayer: ["God, you always keep your promises.", "Help me to trust you like Noah did, even when…", "Thank you that I am safe in Jesus."],
        mission: { compass: "trust", text: "Make a promise tomorrow and keep it, even if it’s hard. Remember that God keeps every promise." },
        journal: "Draw a rainbow. On each colour, write one of God’s promises from the Bible (ask your parent to help you find some).",
      }),
      af: older({
        title: "Die Ark en die Reënboog", bibleStory: "Genesis 6 – 9", readPassage: "Genesis 6:5–22 en 9:8–17",
        story: [
          "Teen Noag se tyd het die wêreld ’n verskriklike plek geword. Die Bybel sê mense se gedagtes was ‘altyd net sleg’. Daar was oral geweld. Dit het God bedroef, wat beteken dit het sy hart seergemaak, dat die mense wat Hy gemaak het so ver van Hom af weggedraai het.",
          "Maar Noag het ‘genade gevind in die oë van die Here’. Noag het met God gewandel. Toe het God vir Noag sy plan vertel: ’n vloed sou die aarde bedek, maar Noag, sy familie en twee van elke soort dier sou veilig gehou word in ’n reusagtige boot wat ’n ark genoem word. God het presiese mates gegee: omtrent 135 meter lank, 22 meter breed en 13 meter hoog.",
          "Die Bybel sê: ‘Noag het alles gedoen net soos God hom beveel het.’ Om die ark te bou het jare gevat. Daar was geen reën in sig nie, en mense het seker gedink Noag het sy verstand verloor. Maar Noag het meer vertrou op wat God gesê het as op wat hy kon sien. Dit is wat geloof is.",
          "Toe die vloed kom, het dit veertig dae en veertig nagte gereën, en die water het selfs die berge bedek. Maar binne-in die ark was almal veilig. God self het die deur toegemaak.",
          "Toe die water eindelik gesak het en Noag op droë grond uitgestap het, was die eerste ding wat hy gedoen het om ’n altaar te bou en God te aanbid. Toe het God ’n verbond, ’n plegtige belofte, met Noag en met elke lewende wese gemaak: nooit weer sou ’n vloed die hele aarde vernietig nie. Die teken van die belofte was die reënboog.",
          "God neem sonde ernstig op, want dit vernietig die mense vir wie Hy liefhet. Maar God maak ook altyd ’n pad van redding. Die ark is ’n prentjie van Jesus: almal wat in Hom is, is veilig.",
        ],
        verse: simple("Ek het my reënboog in die wolke gesit. Dit is die teken van my belofte.", "Genesis 9:13"),
        lessons: ["God neem sonde ernstig op omdat Hy mense liefhet en sonde hulle vernietig.", "Geloof beteken om te vertrou wat God sê, selfs as jy dit nog nie kan sien nie.", "God hou altyd sy beloftes, en Hy maak altyd ’n pad van redding."],
        questions: ["Hoe lank het Noag aan die ark gewerk? Wat dink jy het mense vir hom gesê?", "Hoe is die ark soos Jesus?", "Is daar iets wat God belowe het wat jy nou moeilik vind om te glo?"],
        listen: "Sit stil en stel jou ’n reënboog voor. Vra God: ‘Watter van u beloftes wil U hê moet ek hierdie week onthou?’ Skryf neer wat ook al opkom, en kyk saam met jou ouer in die Bybel daarna.",
        prayer: ["God, U hou altyd u beloftes.", "Help my om U te vertrou soos Noag, selfs as…", "Dankie dat ek veilig is in Jesus."],
        mission: { compass: "trust", text: "Maak môre ’n belofte en hou dit, selfs al is dit moeilik. Onthou dat God elke belofte hou." },
        journal: "Teken ’n reënboog. Skryf op elke kleur een van God se beloftes uit die Bybel (vra jou ouer om jou te help om ’n paar te kry).",
      }),
    },
  },

  /* ---------------- Night 5: Abraham ---------------- */
  "j01-n05": {
    "2-3": {
      en: toddler({
        title: "So Many Stars", bibleStory: "Genesis 15 & 21",
        story: ["Abraham and Sarah wanted a baby very much.", "One night God said, ‘Abraham, look up! Count the stars!’", "One, two, three… so many! Too many to count!", "God said, ‘Your family will be big, like the stars.’", "Abraham believed God. And baby Isaac was born! Sarah laughed and laughed. Nothing is too hard for God."],
        verse: simple("Nothing is too hard for God.", "Jeremiah 32:17"),
        action: "Twinkle your fingers like stars above your head, then count to three together.",
        lessons: ["God is so big. Nothing is too hard for Him."],
        questions: ["Can you see the stars tonight? Who made them?"],
        prayer: ["Dear God,", "you are so big and strong. Amen."],
      }),
      af: toddler({
        title: "Soveel Sterre", bibleStory: "Genesis 15 & 21",
        story: ["Abraham en Sara wou baie graag ’n baba hê.", "Een nag het God gesê: ‘Abraham, kyk op! Tel die sterre!’", "Een, twee, drie… soveel! Te veel om te tel!", "God het gesê: ‘Jou familie sal groot wees, soos die sterre.’", "Abraham het God geglo. En baba Isak is gebore! Sara het gelag en gelag. Niks is vir God te moeilik nie."],
        verse: simple("Niks is vir God te moeilik nie.", "Jeremia 32:17"),
        action: "Laat jou vingers soos sterre bo jou kop vonkel, en tel dan saam tot drie.",
        lessons: ["God is so groot. Niks is vir Hom te moeilik nie."],
        questions: ["Kan jy vanaand die sterre sien? Wie het hulle gemaak?"],
        prayer: ["Liewe God,", "U is so groot en sterk. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Counting Stars", bibleStory: "Genesis 15 & 21", readPassage: "Genesis 15:1–6 and 21:1–7",
        story: [
          "Abram (later renamed Abraham) was 75 years old when God told him to leave his home and go to a land God would show him. God promised to make him into a great nation. Abram went. But years passed, and Abram and his wife Sarai still had no children.",
          "One night God spoke to Abram in a vision: ‘Do not be afraid, Abram. I am your shield, your very great reward.’ Abram was honest with God: ‘What can you give me, since I have no child?’ God didn’t get cross with Abram for asking. Instead He took him outside. ‘Look up at the sky and count the stars, if you can. So shall your offspring be.’",
          "Then comes one of the most important verses in the whole Bible: ‘Abram believed the Lord, and He credited it to him as righteousness.’ Abram didn’t earn God’s approval by being good enough. He simply believed what God said, and God counted him as right with Him. That is how it still works today: we are made right with God by faith, by trusting Jesus.",
          "Believing wasn’t always easy. Abram and Sarai made mistakes while they waited. But God was faithful. When Abraham was 100 and Sarah was 90, she gave birth to a son. They named him Isaac, which means ‘he laughs’. Sarah said, ‘God has brought me laughter.’",
          "Faith means taking God at His word. God speaks, we believe Him, and we keep trusting Him while we wait. Nothing is too hard for the God who made the stars.",
        ],
        verse: simple("Abram believed the Lord, and the Lord counted it to him as righteousness.", "Genesis 15:6"),
        lessons: ["Nothing is too hard for God.", "We are made right with God by believing Him (faith), not by earning it.", "It’s okay to be honest with God about our questions while we wait for His promises."],
        questions: ["What did God show Abram to help him believe?", "What does it mean that Abram’s faith was ‘credited to him as righteousness’?", "What are you waiting and praying for? How can you keep trusting God while you wait?"],
        listen: "If you can, look out of a window at the night sky. Ask God: ‘What do you want me to trust you for?’ Be still and listen. Share what you sense with your parent.",
        prayer: ["God, nothing is too hard for you.", "I believe you, and I want to trust you with…", "Thank you that I am right with you because of Jesus."],
        mission: { compass: "trust", text: "Write down one thing you are trusting God for, and put it somewhere you will see it every day this week." },
        journal: "Write about a time you had to wait for something. What helped? What does Abraham’s story teach you about waiting on God?",
      }),
      af: older({
        title: "Sterre Tel", bibleStory: "Genesis 15 & 21", readPassage: "Genesis 15:1–6 en 21:1–7",
        story: [
          "Abram (later het God sy naam na Abraham verander) was 75 jaar oud toe God vir hom gesê het om sy huis te verlaat en na ’n land te gaan wat God vir hom sou wys. God het belowe om ’n groot nasie van hom te maak. Abram het gegaan. Maar jare het verbygegaan, en Abram en sy vrou Sarai het steeds geen kinders gehad nie.",
          "Een nag het God in ’n visioen met Abram gepraat: ‘Moenie bang wees nie, Abram. Ek is jou skild, jou baie groot beloning.’ Abram was eerlik met God: ‘Wat kan U my gee, want ek het geen kind nie?’ God was nie kwaad vir Abram omdat hy gevra het nie. Hy het hom eerder na buite geneem. ‘Kyk op na die hemel en tel die sterre, as jy kan. So baie sal jou nakomelinge wees.’",
          "Dan kom een van die belangrikste verse in die hele Bybel: ‘Abram het die Here geglo, en Hy het dit vir hom as geregtigheid gereken.’ Abram het nie God se goedkeuring verdien deur goed genoeg te wees nie. Hy het eenvoudig geglo wat God gesê het, en God het hom as reg met Hom gereken. So werk dit vandag nog: ons word reg met God deur geloof, deur Jesus te vertrou.",
          "Om te glo was nie altyd maklik nie. Abram en Sarai het foute gemaak terwyl hulle gewag het. Maar God was getrou. Toe Abraham 100 was en Sara 90, het sy ’n seun in die wêreld gebring. Hulle het hom Isak genoem, wat ‘hy lag’ beteken. Sara het gesê: ‘God het my laat lag.’",
          "Geloof beteken om God op sy woord te neem. God praat, ons glo Hom, en ons hou aan om Hom te vertrou terwyl ons wag. Niks is te moeilik vir die God wat die sterre gemaak het nie.",
        ],
        verse: simple("Abram het die Here geglo, en die Here het dit vir hom as geregtigheid gereken.", "Genesis 15:6"),
        lessons: ["Niks is vir God te moeilik nie.", "Ons word reg met God deur Hom te glo (geloof), nie deur dit te verdien nie.", "Dit is reg om eerlik met God te wees oor ons vrae terwyl ons op sy beloftes wag."],
        questions: ["Wat het God vir Abram gewys om hom te help glo?", "Wat beteken dit dat Abram se geloof ‘as geregtigheid gereken’ is?", "Waarvoor wag en bid jy? Hoe kan jy aanhou om God te vertrou terwyl jy wag?"],
        listen: "As jy kan, kyk deur ’n venster na die naghemel. Vra God: ‘Waarvoor wil U hê moet ek U vertrou?’ Wees stil en luister. Vertel jou ouer wat jy aanvoel.",
        prayer: ["God, niks is vir U te moeilik nie.", "Ek glo U, en ek wil U vertrou met…", "Dankie dat ek reg is met U danksy Jesus."],
        mission: { compass: "trust", text: "Skryf een ding neer waarvoor jy God vertrou, en sit dit êrens waar jy dit hierdie week elke dag sal sien." },
        journal: "Skryf oor ’n keer toe jy vir iets moes wag. Wat het gehelp? Wat leer Abraham se storie jou oor om op God te wag?",
      }),
    },
  },

  /* ---------------- Night 6: Joseph ---------------- */
  "j01-n06": {
    "2-3": {
      en: toddler({
        title: "Joseph’s Coat", bibleStory: "Genesis 37 – 50",
        story: ["Joseph had a coat with lots of colours. Red, blue, yellow, green!", "His brothers were cross. They sent Joseph far away.", "But God was with Joseph all the time.", "God helped Joseph, and Joseph became a big leader.", "When his brothers came, Joseph gave them a big hug. ‘I forgive you,’ he said."],
        verse: simple("God was with Joseph.", "Genesis 39:2"),
        action: "Point to all the colours you can find in your room. Then give someone a big hug, like Joseph.",
        lessons: ["God is with me, even when I am sad."],
        questions: ["What colour would your special coat be?"],
        prayer: ["Dear God,", "thank you that you are always with me. Amen."],
      }),
      af: toddler({
        title: "Josef se Mantel", bibleStory: "Genesis 37 – 50",
        story: ["Josef het ’n mantel met baie kleure gehad. Rooi, blou, geel, groen!", "Sy broers was kwaad. Hulle het Josef ver weg gestuur.", "Maar God was die hele tyd by Josef.", "God het Josef gehelp, en Josef het ’n groot leier geword.", "Toe sy broers kom, het Josef hulle styf vasgedruk. ‘Ek vergewe julle,’ het hy gesê."],
        verse: simple("God was by Josef.", "Genesis 39:2"),
        action: "Wys na al die kleure wat jy in jou kamer kan kry. Druk dan iemand styf vas, soos Josef.",
        lessons: ["God is by my, selfs as ek hartseer is."],
        questions: ["Watter kleur sou jou spesiale mantel wees?"],
        prayer: ["Liewe God,", "dankie dat U altyd by my is. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "From the Pit to the Palace", bibleStory: "Genesis 37 – 50", readPassage: "Genesis 37:3–4, 23–28 and 50:15–21",
        story: [
          "Joseph was the second-youngest of twelve brothers and his father Jacob’s favourite. Jacob gave him a special robe, and Joseph had dreams in which his whole family bowed down to him. His brothers grew to hate him.",
          "One day, far from home, the brothers grabbed Joseph, ripped off his robe and threw him into an empty well. Then they sold him to traders for twenty pieces of silver. Joseph was taken to Egypt as a slave.",
          "In Egypt Joseph worked hard and did what was right, but things kept going wrong. He was falsely accused and thrown into prison for years. Yet again and again Genesis says, ‘The Lord was with Joseph.’ God was with him in the well, in the slave house and in the prison.",
          "God gave Joseph the ability to understand dreams. When Pharaoh, the king of Egypt, had dreams nobody could explain, Joseph was brought out of prison. ‘I cannot do it,’ Joseph said, ‘but God will give Pharaoh the answer.’ God showed that seven years of plenty would be followed by seven years of famine, and Pharaoh put Joseph in charge of all Egypt to prepare.",
          "When the famine came, Joseph’s brothers travelled to Egypt to buy food and bowed before the governor without recognising him. Joseph could have taken revenge. Instead he wept, told them who he was and forgave them. ‘You intended to harm me,’ he said, ‘but God intended it for good, to save many lives.’",
          "Joseph’s story shows that God is in charge even when life is unfair. He doesn’t cause the evil people do, but He can weave even the worst things into His good plan. And it shows that forgiveness is possible, because God helps us to forgive.",
        ],
        verse: simple("You planned to harm me, but God planned it for good.", "Genesis 50:20"),
        lessons: ["God is with His children in every hard place.", "God is in charge, and He can turn even bad things into good.", "With God’s help, we can forgive people who hurt us."],
        questions: ["How many times did life go wrong for Joseph? What stayed the same each time?", "Why do you think Joseph chose to forgive instead of taking revenge?", "Is there someone you find hard to forgive? What would it look like to forgive them?"],
        listen: "Sit quietly and ask God: ‘Where were you when things were hard for me?’ Listen for His answer. You might remember a moment when you felt His help. Thank Him for it.",
        prayer: ["God, thank you that you were with Joseph and you are with me.", "Please help me to forgive…", "I trust you to turn hard things into good."],
        mission: { compass: "love", text: "Do something kind tomorrow for someone who has upset you, just as Joseph did for his brothers." },
        journal: "Draw Joseph’s journey: the well, the slave house, the prison, the palace. Next to each, write ‘God was with Joseph.’ Then add a place from your own life.",
      }),
      af: older({
        title: "Van die Put tot die Paleis", bibleStory: "Genesis 37 – 50", readPassage: "Genesis 37:3–4, 23–28 en 50:15–21",
        story: [
          "Josef was die tweede jongste van twaalf broers en sy pa Jakob se gunsteling. Jakob het vir hom ’n spesiale mantel gegee, en Josef het drome gehad waarin sy hele familie voor hom gebuig het. Sy broers het hom begin haat.",
          "Eendag, ver van die huis af, het die broers Josef gegryp, sy mantel afgeskeur en hom in ’n leë put gegooi. Toe het hulle hom vir twintig silwerstukke aan handelaars verkoop. Josef is as ’n slaaf na Egipte geneem.",
          "In Egipte het Josef hard gewerk en reg gedoen, maar dinge het aanhou skeefloop. Hy is valslik beskuldig en jare lank in die tronk gegooi. Tog sê Genesis keer op keer: ‘Die Here was met Josef.’ God was by hom in die put, in die slawehuis en in die tronk.",
          "God het Josef die vermoë gegee om drome te verstaan. Toe Farao, die koning van Egipte, drome gehad het wat niemand kon verklaar nie, is Josef uit die tronk gebring. ‘Ek kan dit nie doen nie,’ het Josef gesê, ‘maar God sal Farao die antwoord gee.’ God het gewys dat sewe jaar van oorvloed deur sewe jaar van hongersnood gevolg sou word, en Farao het Josef in beheer van die hele Egipte gesit om voor te berei.",
          "Toe die hongersnood kom, het Josef se broers na Egipte gereis om kos te koop en voor die goewerneur gebuig sonder om hom te herken. Josef kon wraak geneem het. Hy het eerder gehuil, vir hulle vertel wie hy is en hulle vergewe. ‘Julle het beplan om my kwaad te doen,’ het hy gesê, ‘maar God het dit ten goede bedoel, om baie lewens te red.’",
          "Josef se storie wys dat God in beheer is, selfs as die lewe onregverdig is. Hy veroorsaak nie die kwaad wat mense doen nie, maar Hy kan selfs die ergste dinge in sy goeie plan inweef. En dit wys dat vergifnis moontlik is, want God help ons om te vergewe.",
        ],
        verse: simple("Julle het beplan om my kwaad te doen, maar God het dit ten goede bedoel.", "Genesis 50:20"),
        lessons: ["God is by sy kinders op elke moeilike plek.", "God is in beheer, en Hy kan selfs slegte dinge in iets goeds verander.", "Met God se hulp kan ons mense vergewe wat ons seergemaak het."],
        questions: ["Hoeveel keer het dinge vir Josef skeefgeloop? Wat het elke keer dieselfde gebly?", "Hoekom dink jy het Josef gekies om te vergewe in plaas van om wraak te neem?", "Is daar iemand wat jy moeilik vind om te vergewe? Hoe sou dit lyk om hulle te vergewe?"],
        listen: "Sit stil en vra God: ‘Waar was U toe dinge vir my moeilik was?’ Luister na sy antwoord. Dalk onthou jy ’n oomblik toe jy sy hulp gevoel het. Dank Hom daarvoor.",
        prayer: ["God, dankie dat U by Josef was en dat U by my is.", "Help my asseblief om te vergewe…", "Ek vertrou U om moeilike dinge in goed te verander."],
        mission: { compass: "love", text: "Doen môre iets gaaf vir iemand wat jou ontstel het, net soos Josef vir sy broers gedoen het." },
        journal: "Teken Josef se reis: die put, die slawehuis, die tronk, die paleis. Skryf langs elkeen: ‘God was met Josef.’ Voeg dan ’n plek uit jou eie lewe by.",
      }),
    },
  },

  /* ---------------- Night 7: Campfire ---------------- */
  "j01-n07": {
    "2-3": {
      en: toddler({
        title: "Campfire Night",
        story: ["Well done, little explorer! Let’s sit by the campfire and remember: God made everything. God made me. God loves me. God keeps His promises. God is with me."],
        game: "Animal parade: stomp like an elephant, hop like a bunny, roar like a lion. God made them all!",
        lessons: [], questions: ["What is your favourite animal that God made?"],
        prayer: ["Thank you, God,", "for everything you made. Amen."],
      }),
      af: toddler({
        title: "Kampvuuraand",
        story: ["Mooi so, klein ontdekker! Kom ons sit by die kampvuur en onthou: God het alles gemaak. God het my gemaak. God is lief vir my. God hou sy beloftes. God is by my."],
        game: "Dierparade: stamp soos ’n olifant, spring soos ’n haas, brul soos ’n leeu. God het hulle almal gemaak!",
        lessons: [], questions: ["Wat is jou gunstelingdier wat God gemaak het?"],
        prayer: ["Dankie, God,", "vir alles wat U gemaak het. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Campfire Night: The Maker’s Garden",
        story: ["You’ve finished your first expedition! This week you saw God create the universe with His words, make people in His image, come looking for Adam and Eve, rescue Noah, keep His promise to Abraham and turn Joseph’s pain into good. Tonight, look back and see what you have discovered about who God is."],
        game: "Treasure quiz: your parent reads out a treasure (for example ‘God is in charge’), and you name the story and one detail from it. Then swap: you read one out and your parent answers!",
        lessons: [],
        questions: ["Which treasure about God surprised you most this week?", "Which of these did you see most this week: God as Father, Jesus, the Holy Spirit, God speaking, or obeying because we love Him?", "How has this week changed the way you talk to God?"],
        prayer: ["God, you are my Creator and my Father.", "This week I learned that you…", "Thank you that I am your child."],
        mission: { compass: "listen", text: "Learn Genesis 1:1 by heart and teach it to someone in your family." },
        journal: "Make a treasure map of this expedition: draw six treasure chests and write one thing you learned about God in each.",
      }),
      af: older({
        title: "Kampvuuraand: Die Skepper se Tuin",
        story: ["Jy het jou eerste ekspedisie klaargemaak! Hierdie week het jy gesien hoe God die heelal met sy woorde skep, mense na sy beeld maak, na Adam en Eva kom soek, Noag red, sy belofte aan Abraham hou en Josef se pyn in iets goeds verander. Kyk vanaand terug en sien wat jy ontdek het oor wie God is."],
        game: "Skattevasvra: jou ouer lees ’n skat voor (byvoorbeeld ‘God is in beheer’), en jy noem die storie en een besonderheid daaruit. Ruil dan om: jy lees een voor en jou ouer antwoord!",
        lessons: [],
        questions: ["Watter skat oor God het jou hierdie week die meeste verras?", "Wat het jy hierdie week die meeste gesien: God as Vader, Jesus, die Heilige Gees, God wat praat, of gehoorsaam omdat ons Hom liefhet?", "Hoe het hierdie week die manier verander waarop jy met God praat?"],
        prayer: ["God, U is my Skepper en my Vader.", "Hierdie week het ek geleer dat U…", "Dankie dat ek u kind is."],
        mission: { compass: "listen", text: "Leer Genesis 1:1 uit jou kop en leer dit vir iemand in jou familie." },
        journal: "Maak ’n skatkaart van hierdie ekspedisie: teken ses skatkiste en skryf in elkeen een ding wat jy oor God geleer het.",
      }),
    },
  },
};
