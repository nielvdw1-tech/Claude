/**
 * Journey Trail 1, Expedition 4 (The River of Second Chances): ages 2–3 and 8–9, English and Afrikaans.
 * Status: DRAFT, awaiting review (see docs/CONTENT-GUIDE.md section 7).
 */
const simple = (text, refText) => ({ text, refText, wording: "simple" });
const toddler = (o) => ({ prayerStyle: "repeat", ...o });
const older = (o) => ({ prayerStyle: "own", ...o });

export default {
  /* ---------------- Night 22: Jonah ---------------- */
  "j01-n22": {
    "2-3": {
      en: toddler({
        title: "Jonah and the Big Fish", bibleStory: "Jonah 1 – 3",
        story: ["God said, ‘Jonah, go to the big city.’ But Jonah ran away on a boat!", "A big storm came. Splash, crash went the waves!", "Jonah fell into the sea, and a big fish swallowed him. Gulp!", "Inside the fish Jonah prayed, ‘Sorry, God!’", "The fish spat him out on the beach. God gave Jonah another chance!"],
        verse: simple("God’s love never runs out.", "Lamentations 3:22"),
        action: "Rock from side to side like a boat in a storm. Then open your arms wide and GULP like a big fish!",
        lessons: ["When I say sorry, God gives me another chance."],
        questions: ["What sound does a big fish make? Gulp!"],
        prayer: ["Thank you, God,", "for loving me when I say sorry. Amen."],
      }),
      af: toddler({
        title: "Jona en die Groot Vis", bibleStory: "Jona 1 – 3",
        story: ["God het gesê: ‘Jona, gaan na die groot stad.’ Maar Jona het op ’n boot weggehardloop!", "’n Groot storm het gekom. Plons, kraak het die golwe gegaan!", "Jona het in die see geval, en ’n groot vis het hom ingesluk. Sluk!", "Binne-in die vis het Jona gebid: ‘Jammer, God!’", "Die vis het hom op die strand uitgespoeg. God het vir Jona nog ’n kans gegee!"],
        verse: simple("God se liefde raak nooit op nie.", "Klaagliedere 3:22"),
        action: "Wieg heen en weer soos ’n boot in ’n storm. Maak dan jou arms wyd oop en SLUK soos ’n groot vis!",
        lessons: ["As ek jammer sê, gee God my nog ’n kans."],
        questions: ["Watter geluid maak ’n groot vis? Sluk!"],
        prayer: ["Dankie, God,", "dat U my liefhet as ek jammer sê. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Running from God, Caught by Grace", bibleStory: "Jonah 1 – 4", readPassage: "Jonah 1:1–3, 1:17 – 2:2, 3:1–5",
        story: [
          "God gave the prophet Jonah a clear instruction: ‘Go to the great city of Nineveh and preach against it, because its wickedness has come up before me.’ Nineveh was the capital of Assyria, Israel’s cruel enemy. Jonah didn’t want those people to have any chance of forgiveness. So he did the opposite: he went down to the port and bought a ticket on a ship sailing as far away as possible.",
          "But you can’t outrun God. He sent a violent storm. The sailors were terrified and threw cargo overboard, while Jonah slept below deck. When they discovered he was running from God, Jonah told them, ‘Throw me into the sea, and it will become calm.’ They did, and the storm stopped immediately.",
          "Then ‘the Lord provided a huge fish to swallow Jonah’. Notice the word ‘provided’. The fish wasn’t a punishment; it was God’s rescue! For three days and nights Jonah sat in the dark, and there he finally prayed: ‘In my distress I called to the Lord, and He answered me.’ The fish spat Jonah out onto dry land.",
          "Then the word of the Lord came to Jonah ‘a second time’. God gave him a second chance. This time Jonah went to Nineveh. He preached, and the whole city, from the king down, turned from their evil ways and asked God for mercy. And God forgave them.",
          "You might think Jonah would be thrilled, but he was furious! He said to God, ‘I knew that you are a gracious and compassionate God, slow to anger and abounding in love.’ Jonah was angry because God was kind to people Jonah didn’t like.",
          "The book ends with God asking Jonah a question: shouldn’t I care about all these people? God’s mercy is bigger than our likes and dislikes. He gives second chances to runaway prophets and to cruel cities, and He gives them to us, through Jesus.",
        ],
        verse: simple("Because of the Lord’s great love we are not consumed, for His compassions never fail. They are new every morning.", "Lamentations 3:22–23"),
        lessons: ["God is merciful: He gives second chances to people who turn back to Him.", "We can never run so far that God cannot reach us.", "God’s mercy is for everyone, even people we find hard to love."],
        questions: ["Why didn’t Jonah want to go to Nineveh?", "How was the big fish actually a rescue?", "Is there someone you don’t want God to be kind to? What would God say to you about them?"],
        listen: "Be still and ask God: ‘Is there anywhere I am running from you?’ Listen. If something comes to mind, turn back to Him. Then listen again for His kind words to you.",
        prayer: ["God, thank you for second chances.", "I’m sorry for running from you when…", "Help me to want your mercy for everyone, even…"],
        mission: { compass: "love", text: "Tomorrow, give someone a second chance: forgive them quickly, or include someone you usually avoid." },
        journal: "Write about a time you got a second chance. How did it feel? Then write a short prayer for someone who needs a second chance.",
      }),
      af: older({
        title: "Weghardloop van God, Gevang deur Genade", bibleStory: "Jona 1 – 4", readPassage: "Jona 1:1–3, 2:1–3, 3:1–5",
        story: [
          "God het die profeet Jona ’n duidelike opdrag gegee: ‘Gaan na die groot stad Nineve en preek teen hom, want sy slegtheid het voor My gekom.’ Nineve was die hoofstad van Assirië, Israel se wrede vyand. Jona wou nie hê daardie mense moet enige kans op vergifnis kry nie. Toe doen hy die teenoorgestelde: hy gaan na die hawe en koop ’n kaartjie op ’n skip wat so ver as moontlik vaar.",
          "Maar jy kan nie van God af weghardloop nie. Hy het ’n wilde storm gestuur. Die matrose was doodbang en het vrag oorboord gegooi, terwyl Jona onder op die skip geslaap het. Toe hulle uitvind hy hardloop van God af weg, het Jona vir hulle gesê: ‘Gooi my in die see, dan sal dit kalm word.’ Hulle het, en die storm het dadelik opgehou.",
          "Toe het ‘die Here ’n groot vis gestuur om Jona in te sluk’. Die vis was nie ’n straf nie; dit was God se redding! Drie dae en nagte lank het Jona in die donker gesit, en daar het hy eindelik gebid: ‘In my nood het ek na die Here geroep, en Hy het my geantwoord.’ Die vis het Jona op droë grond uitgespoeg.",
          "Toe het die woord van die Here ‘vir die tweede keer’ na Jona gekom. God het hom ’n tweede kans gegee. Hierdie keer het Jona na Nineve gegaan. Hy het gepreek, en die hele stad, van die koning af tot almal, het van hulle slegte paaie omgedraai en God om genade gevra. En God het hulle vergewe.",
          "Jy sou dink Jona sou baie bly wees, maar hy was woedend! Hy het vir God gesê: ‘Ek het geweet U is ’n God wat genadig en barmhartig is, wat nie gou kwaad word nie en vol liefde is.’ Jona was kwaad omdat God goed was vir mense van wie Jona nie gehou het nie.",
          "Die boek eindig met ’n vraag van God aan Jona: moet Ek nie omgee vir al hierdie mense nie? God se genade is groter as wie ons van hou en nie van hou nie. Hy gee tweede kanse aan profete wat weghardloop en aan wrede stede, en Hy gee dit aan ons, deur Jesus.",
        ],
        verse: simple("Die Here se liefde raak nooit op nie; sy goedheid is elke oggend nuut.", "Klaagliedere 3:22–23"),
        lessons: ["God is genadig: Hy gee tweede kanse aan mense wat na Hom terugdraai.", "Ons kan nooit so ver weghardloop dat God ons nie kan bereik nie.", "God se genade is vir almal, selfs vir mense vir wie ons moeilik kan liefhê."],
        questions: ["Hoekom wou Jona nie na Nineve gaan nie?", "Hoe was die groot vis eintlik ’n redding?", "Is daar iemand vir wie jy nie wil hê God goed moet wees nie? Wat sou God vir jou oor hulle sê?"],
        listen: "Wees stil en vra God: ‘Is daar iets waarvoor ek van U af weghardloop?’ Luister. As iets opkom, draai terug na Hom. Luister dan weer na sy liefdevolle woorde vir jou.",
        prayer: ["God, dankie vir tweede kanse.", "Ek is jammer dat ek van U af weggehardloop het toe…", "Help my om u genade vir almal te wil hê, selfs vir…"],
        mission: { compass: "love", text: "Gee môre vir iemand ’n tweede kans: vergewe hulle vinnig, of sluit iemand in wat jy gewoonlik vermy." },
        journal: "Skryf oor ’n keer toe jy ’n tweede kans gekry het. Hoe het dit gevoel? Skryf dan ’n kort gebed vir iemand wat ’n tweede kans nodig het.",
      }),
    },
  },

  /* ---------------- Night 23: The fiery furnace ---------------- */
  "j01-n23": {
    "2-3": {
      en: toddler({
        title: "Three Friends and the Fire", bibleStory: "Daniel 3",
        story: ["A king made a big gold statue. ‘Everybody bow down!’ he said.", "But three friends said, ‘We only bow to God!’", "The king was very cross. He put them in a hot, hot fire!", "But look! God was in the fire with them!", "They came out safe. Not even their hair was burnt!"],
        verse: simple("God is the King of everything.", "Psalm 47:2"),
        action: "Stand up straight and tall like the three friends: ‘We only bow to God!’ Then wiggle your fingers like flickering flames.",
        lessons: ["God is the biggest King. I love Him most."],
        questions: ["Can you stand up tall and strong?"],
        prayer: ["Dear God,", "you are my King. Amen."],
      }),
      af: toddler({
        title: "Drie Vriende en die Vuur", bibleStory: "Daniël 3",
        story: ["’n Koning het ’n groot goue beeld gemaak. ‘Almal moet buig!’ het hy gesê.", "Maar drie vriende het gesê: ‘Ons buig net voor God!’", "Die koning was baie kwaad. Hy het hulle in ’n warm, warm vuur gegooi!", "Maar kyk! God was saam met hulle in die vuur!", "Hulle het veilig uitgekom. Nie eens hulle hare was verbrand nie!"],
        verse: simple("God is die Koning van alles.", "Psalm 47:3"),
        action: "Staan regop en lank soos die drie vriende: ‘Ons buig net voor God!’ Wikkel dan jou vingers soos vlammetjies.",
        lessons: ["God is die grootste Koning. Ek is die liefste vir Hom."],
        questions: ["Kan jy regop en sterk staan?"],
        prayer: ["Liewe God,", "U is my Koning. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Even If He Does Not", bibleStory: "Daniel 3", readPassage: "Daniel 3:13–28",
        story: [
          "King Nebuchadnezzar of Babylon built a golden statue about twenty-seven metres tall and gathered all his officials. A herald announced: when the music plays, everyone must fall down and worship the statue. Anyone who refused would be thrown into a blazing furnace.",
          "The music played, and thousands of people bowed. Three young Jewish men stayed standing: Shadrach, Meshach and Abednego. They had been taken from Jerusalem and trained to serve the king, and they served him well. But they would not worship anyone except the true God.",
          "Furious, the king gave them one more chance, and then sneered, ‘What god will be able to rescue you from my hand?’ Their answer is one of the bravest in the Bible: ‘The God we serve is able to deliver us from the furnace, and He will deliver us from Your Majesty’s hand. But even if He does not, we want you to know that we will not serve your gods.’",
          "Notice their faith. They believed God could save them. They also trusted Him enough to stay faithful even if He chose not to. Their faith wasn’t in a particular result; it was in God Himself.",
          "The king ordered the furnace heated seven times hotter. The heat was so fierce that it killed the soldiers who threw the three men in. Then the king leapt to his feet: ‘Weren’t there three men we tied up? Look! I see four men walking around in the fire, unbound and unharmed, and the fourth looks like a son of the gods!’",
          "God was in the fire with them. When they came out, not a hair was singed, and they didn’t even smell of smoke. Nebuchadnezzar praised their God, ‘for no other god can save in this way’. God doesn’t always keep us out of the fire, but He promises to be with us in it.",
        ],
        verse: simple("For the Lord Most High is awesome, the great King over all the earth.", "Psalm 47:2"),
        lessons: ["God alone is King, and He alone deserves our worship.", "True faith trusts God Himself, not only the result we hope for.", "God is with His children in the fire: we never face trouble alone."],
        questions: ["What did the three friends say they would do ‘even if’ God didn’t rescue them?", "Who was the fourth man in the fire?", "What ‘statues’ do people bow to today (things they make more important than God)?"],
        listen: "Be still and ask God: ‘Is there anything I have made more important than you?’ Listen honestly. Then tell God He is your King.",
        prayer: ["God, you are the great King over everything.", "Help me to put you first, above…", "Thank you that you are with me in hard times."],
        mission: { compass: "love", text: "Tomorrow, before you play or watch anything, spend a few minutes with God first, to show Him He comes first." },
        journal: "Write the words ‘Even if He does not…’ and finish the sentence in your own words, as a prayer of trust.",
      }),
      af: older({
        title: "Selfs as Hy Nie Doen Nie", bibleStory: "Daniël 3", readPassage: "Daniël 3:13–28",
        story: [
          "Koning Nebukadnesar van Babel het ’n goue beeld van omtrent sewe-en-twintig meter hoog gebou en al sy amptenare bymekaargeroep. ’n Omroeper het aangekondig: as die musiek speel, moet almal neerval en die beeld aanbid. Enigiemand wat weier, sou in ’n brandende oond gegooi word.",
          "Die musiek het gespeel, en duisende mense het gebuig. Drie jong Joodse mans het bly staan: Sadrag, Mesag en Abednego. Hulle is uit Jerusalem weggevoer en opgelei om die koning te dien, en hulle het hom goed gedien. Maar hulle sou niemand behalwe die ware God aanbid nie.",
          "Woedend het die koning hulle nog een kans gegee, en toe gespot: ‘Watter god sal julle uit my hand kan red?’ Hulle antwoord is een van die dapperste in die Bybel: ‘Die God wat ons dien, kan ons uit die oond red, en Hy sal ons uit u hand red, o koning. Maar selfs as Hy dit nie doen nie, moet u weet dat ons nie u gode sal dien nie.’",
          "Kyk na hulle geloof. Hulle het geglo God kán hulle red. Hulle het Hom ook genoeg vertrou om getrou te bly, selfs as Hy kies om dit nie te doen nie. Hulle geloof was nie in ’n sekere uitkoms nie; dit was in God self.",
          "Die koning het beveel dat die oond sewe keer warmer gemaak word. Die hitte was so erg dat dit die soldate doodgemaak het wat die drie mans ingegooi het. Toe spring die koning op: ‘Het ons nie drie mans vasgebind nie? Kyk! Ek sien vier mans wat in die vuur rondloop, los en ongedeerd, en die vierde lyk soos ’n seun van die gode!’",
          "God was saam met hulle in die vuur. Toe hulle uitkom, was nie een haar geskroei nie, en hulle het nie eens na rook geruik nie. Nebukadnesar het hulle God geprys, ‘want geen ander god kan so red nie’. God hou ons nie altyd uit die vuur nie, maar Hy belowe om saam met ons daarin te wees.",
        ],
        verse: simple("Want die Here, die Allerhoogste, is ontsagwekkend, die groot Koning oor die hele aarde.", "Psalm 47:3"),
        lessons: ["God alleen is Koning, en Hy alleen verdien ons aanbidding.", "Ware geloof vertrou God self, nie net die uitkoms waarop ons hoop nie.", "God is saam met sy kinders in die vuur: ons staan nooit alleen voor moeilikheid nie."],
        questions: ["Wat het die drie vriende gesê sal hulle doen ‘selfs as’ God hulle nie red nie?", "Wie was die vierde man in die vuur?", "Watter ‘beelde’ buig mense vandag voor (dinge wat hulle belangriker as God maak)?"],
        listen: "Wees stil en vra God: ‘Is daar iets wat ek belangriker as U gemaak het?’ Luister eerlik. Sê dan vir God Hy is jou Koning.",
        prayer: ["God, U is die groot Koning oor alles.", "Help my om U eerste te stel, bo…", "Dankie dat U by my is in moeilike tye."],
        mission: { compass: "love", text: "Spandeer môre, voordat jy speel of iets kyk, eers ’n paar minute saam met God, om vir Hom te wys Hy kom eerste." },
        journal: "Skryf die woorde ‘Selfs as Hy nie…’ en maak die sin in jou eie woorde klaar, as ’n gebed van vertroue.",
      }),
    },
  },

  /* ---------------- Night 24: Esther ---------------- */
  "j01-n24": {
    "2-3": {
      en: toddler({
        title: "Brave Queen Esther", bibleStory: "Esther 4 – 8",
        story: ["Esther was a beautiful queen.", "A bad man wanted to hurt God’s people. Oh no!", "Esther was scared. But she prayed, and her friends prayed too.", "Then she bravely went to the king. The king smiled and held out his gold stick!", "Esther saved God’s people. God had a plan all along!"],
        verse: simple("God has good plans for me.", "Jeremiah 29:11"),
        action: "Put on a pretend crown and walk like a queen or king. Then hold out a pretend gold stick and smile!",
        lessons: ["God has a good plan for me."],
        questions: ["Can you walk like a queen or a king?"],
        prayer: ["Dear God,", "thank you for your good plans. Amen."],
      }),
      af: toddler({
        title: "Dapper Koningin Ester", bibleStory: "Ester 4 – 8",
        story: ["Ester was ’n pragtige koningin.", "’n Slegte man wou God se mense seermaak. O nee!", "Ester was bang. Maar sy het gebid, en haar vriende het ook gebid.", "Toe het sy dapper na die koning gegaan. Die koning het geglimlag en sy goue stok uitgehou!", "Ester het God se mense gered. God het heeltyd ’n plan gehad!"],
        verse: simple("God het goeie planne vir my.", "Jeremia 29:11"),
        action: "Sit ’n kamma-kroon op en loop soos ’n koningin of koning. Hou dan ’n kamma-goue stok uit en glimlag!",
        lessons: ["God het ’n goeie plan vir my."],
        questions: ["Kan jy loop soos ’n koningin of ’n koning?"],
        prayer: ["Liewe God,", "dankie vir u goeie planne. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "For Such a Time as This", bibleStory: "Esther 2 – 8", readPassage: "Esther 4:10–16",
        story: [
          "Esther was a Jewish orphan living in Persia, raised by her older cousin Mordecai. When King Xerxes searched his empire for a new queen, Esther was chosen. On Mordecai’s advice, she didn’t tell anyone she was Jewish.",
          "Meanwhile, a proud official named Haman hated Mordecai because he wouldn’t bow to him. When Haman discovered Mordecai was a Jew, he decided to destroy every Jew in the empire. He tricked the king into signing a law that, on a set day, all the Jews could be killed.",
          "Mordecai sent a message to Esther: she must go to the king and plead for her people. But there was a problem. Anyone who went to the king without being invited could be put to death, unless the king held out his golden sceptre. Esther hadn’t been called for a whole month.",
          "Mordecai replied with famous words: ‘Who knows but that you have come to your royal position for such a time as this?’ Esther made her decision: ‘Go, gather all the Jews, and fast for me. Do not eat or drink for three days. I and my attendants will fast as you do. Then I will go to the king, even though it is against the law. And if I perish, I perish.’",
          "After three days Esther went to the king. He held out the sceptre! Over two banquets she revealed Haman’s evil plan, and the king turned against Haman. A new law allowed the Jews to defend themselves, and God’s people were saved. Jewish families still celebrate it today at the festival of Purim.",
          "Here is something surprising: God’s name is never mentioned in the book of Esther. Yet He was working through every detail: an orphan becoming queen, a sleepless night for the king, perfect timing. God placed Esther exactly where she needed to be. He places you where you are for a reason too.",
        ],
        verse: simple("‘I know the plans I have for you,’ declares the Lord, ‘plans to give you hope and a future.’", "Jeremiah 29:11"),
        lessons: ["God has a good plan, even when we can’t see Him working.", "God places His children where they are for a reason.", "Courage often begins with prayer, and with asking others to pray with us."],
        questions: ["Why was it dangerous for Esther to go to the king?", "What did Esther do before she went? Why do you think that mattered?", "Where has God placed you (your family, school, friends)? How could you be brave there ‘for such a time as this’?"],
        listen: "Be still and ask God: ‘Why have you placed me where I am?’ Listen. Maybe God will remind you of someone at school or in your family who needs you.",
        prayer: ["God, thank you that you have a good plan for my life.", "Give me courage to…", "Use me where you have placed me."],
        mission: { compass: "trust", text: "Before something hard tomorrow, ask a parent or friend to pray with you, like Esther did." },
        journal: "Write ‘For such a time as this’ at the top of a page. Underneath, list the places and people God has put in your life, and one way you can help each one.",
      }),
      af: older({
        title: "Vir ’n Tyd soos Hierdie", bibleStory: "Ester 2 – 8", readPassage: "Ester 4:10–16",
        story: [
          "Ester was ’n Joodse weeskind wat in Persië gewoon het, grootgemaak deur haar ouer neef Mordegai. Toe koning Xerxes deur sy ryk na ’n nuwe koningin gesoek het, is Ester gekies. Op Mordegai se raad het sy vir niemand gesê dat sy ’n Jood is nie.",
          "Intussen het ’n trotse amptenaar met die naam Haman Mordegai gehaat omdat hy nie voor hom wou buig nie. Toe Haman uitvind Mordegai is ’n Jood, het hy besluit om elke Jood in die ryk uit te wis. Hy het die koning gekul om ’n wet te teken dat al die Jode op ’n sekere dag doodgemaak kon word.",
          "Mordegai het vir Ester ’n boodskap gestuur: sy moet na die koning gaan en vir haar volk pleit. Maar daar was ’n probleem. Enigiemand wat sonder ’n uitnodiging na die koning gegaan het, kon doodgemaak word, tensy die koning sy goue septer uithou. Ester is al ’n hele maand lank nie geroep nie.",
          "Mordegai het met bekende woorde geantwoord: ‘Wie weet of jy nie juis vir ’n tyd soos hierdie koningin geword het nie?’ Ester het haar besluit geneem: ‘Gaan maak al die Jode bymekaar, en vas vir my. Moenie drie dae lank eet of drink nie. Ek en my diensmeisies sal ook so vas. Dan sal ek na die koning gaan, al is dit teen die wet. En as ek moet sterf, dan sterf ek.’",
          "Ná drie dae het Ester na die koning gegaan. Hy het die septer uitgehou! By twee feesmaaltye het sy Haman se slegte plan bekend gemaak, en die koning het teen Haman gedraai. ’n Nuwe wet het die Jode toegelaat om hulleself te verdedig, en God se mense is gered. Joodse families vier dit vandag nog by die fees van Purim.",
          "Hier is iets verrassends: God se naam word nooit in die boek Ester genoem nie. Tog was Hy in elke detail aan die werk: ’n weeskind wat koningin word, ’n slapelose nag vir die koning, presiese tydsberekening. God het Ester presies op die regte plek gesit. Hy het jou ook met ’n rede gesit waar jy is.",
        ],
        verse: simple("‘Ek weet watter planne Ek vir jou het,’ sê die Here, ‘planne om jou hoop en ’n toekoms te gee.’", "Jeremia 29:11"),
        lessons: ["God het ’n goeie plan, selfs as ons Hom nie sien werk nie.", "God sit sy kinders met ’n rede waar hulle is.", "Moed begin dikwels met gebed, en met om ander te vra om saam met ons te bid."],
        questions: ["Hoekom was dit gevaarlik vir Ester om na die koning te gaan?", "Wat het Ester gedoen voordat sy gegaan het? Hoekom dink jy was dit belangrik?", "Waar het God jou gesit (jou familie, skool, maats)? Hoe kan jy daar dapper wees ‘vir ’n tyd soos hierdie’?"],
        listen: "Wees stil en vra God: ‘Hoekom het U my gesit waar ek is?’ Luister. Dalk sal God jou herinner aan iemand by die skool of in jou familie wat jou nodig het.",
        prayer: ["God, dankie dat U ’n goeie plan vir my lewe het.", "Gee my moed om…", "Gebruik my waar U my gesit het."],
        mission: { compass: "trust", text: "Vra môre, voor iets moeiliks, vir ’n ouer of ’n maat om saam met jou te bid, soos Ester gedoen het." },
        journal: "Skryf ‘Vir ’n tyd soos hierdie’ bo-aan ’n bladsy. Skryf daaronder die plekke en mense wat God in jou lewe gesit het, en een manier hoe jy elkeen kan help.",
      }),
    },
  },

  /* ---------------- Night 25: Ruth ---------------- */
  "j01-n25": {
    "2-3": {
      en: toddler({
        title: "Ruth Stays Close", bibleStory: "Ruth 1 – 4",
        story: ["Naomi was very sad and lonely.", "Ruth gave her a big hug. ‘I will stay with you!’", "They walked a long way to Bethlehem.", "Kind Boaz let Ruth pick up wheat in his field. ‘Take as much as you like!’", "God was kind to Ruth and Naomi. They were happy again!"],
        verse: simple("God is kind to everyone.", "Psalm 145:9"),
        action: "Give someone a big hug, like Ruth. Then pretend to pick up wheat and put it in your arms.",
        lessons: ["God is kind, and He helps me to be kind."],
        questions: ["Who can you give a hug to?"],
        prayer: ["Dear God,", "help me to be kind like you. Amen."],
      }),
      af: toddler({
        title: "Rut Bly Naby", bibleStory: "Rut 1 – 4",
        story: ["Naomi was baie hartseer en alleen.", "Rut het haar styf vasgedruk. ‘Ek sal by jou bly!’", "Hulle het ’n lang pad na Betlehem geloop.", "Vriendelike Boas het vir Rut koring op sy land laat optel. ‘Vat soveel as wat jy wil!’", "God was goed vir Rut en Naomi. Hulle was weer gelukkig!"],
        verse: simple("God is goed vir almal.", "Psalm 145:9"),
        action: "Druk iemand styf vas, soos Rut. Maak dan of jy koring optel en dit in jou arms hou.",
        lessons: ["God is goed, en Hy help my om gaaf te wees."],
        questions: ["Vir wie kan jy ’n drukkie gee?"],
        prayer: ["Liewe God,", "help my om gaaf te wees soos U. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Where You Go, I Will Go", bibleStory: "Ruth 1 – 4", readPassage: "Ruth 1:15–18 and 2:8–12",
        story: [
          "During a famine, an Israelite woman named Naomi moved with her husband and two sons to the country of Moab. Her sons married Moabite women, Orpah and Ruth. Then tragedy struck: Naomi’s husband and both her sons died. Naomi was left with nothing but sadness. She even said, ‘Don’t call me Naomi [which means ‘pleasant’]. Call me Mara [which means ‘bitter’].’",
          "Naomi decided to go home to Bethlehem, and told her daughters-in-law to go back to their own families. Orpah tearfully said goodbye. But Ruth clung to Naomi and made one of the most beautiful promises in the Bible: ‘Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God.’ Ruth, a foreigner, chose to belong to the God of Israel.",
          "In Bethlehem, the two widows had no food. Ruth went to gather leftover grain behind the harvesters, which was something God’s law allowed poor people to do. She happened to choose a field owned by Boaz, a relative of Naomi’s husband. Boaz noticed her and was kind. ‘May the Lord repay you for what you have done,’ he said. ‘May you be richly rewarded by the Lord, under whose wings you have come to take refuge.’ He quietly told his workers to drop extra grain for her.",
          "Boaz was a ‘kinsman-redeemer’, a relative with the right to rescue a family in trouble. He married Ruth and took care of Naomi too. They had a son named Obed, and Naomi held her grandson with joy.",
          "The story ends with a surprise: Obed became the grandfather of King David. Many generations later, Jesus was born from this family line. God welcomed a foreigner from an enemy country into His family and wove her into the story of Jesus. And Jesus is our Redeemer, the One who rescues us and brings us into God’s family.",
        ],
        verse: simple("The Lord is good to all; He has compassion on all He has made.", "Psalm 145:9"),
        lessons: ["God cares for people who are lonely, grieving and in need.", "God often shows His kindness through the kindness of people.", "God welcomes everyone into His family, and Jesus is our Redeemer."],
        questions: ["What did Ruth promise Naomi?", "How did Boaz show God’s kindness?", "Who around you is lonely or going through a sad time? How could you be like Ruth or Boaz to them?"],
        listen: "Be still and ask God: ‘Who do you want me to be kind to this week?’ Listen. Write down the name that comes to mind.",
        prayer: ["God, thank you that you are kind and you care for lonely people.", "Please comfort…", "Help me to show your kindness like Ruth and Boaz did."],
        mission: { compass: "love", text: "Do something kind tomorrow for someone who is sad or lonely: a note, a drawing, or just sitting with them." },
        journal: "Write Ruth’s promise (‘Where you go I will go…’) and then write your own promise to God in your own words.",
      }),
      af: older({
        title: "Waar Jy Gaan, Sal Ek Gaan", bibleStory: "Rut 1 – 4", readPassage: "Rut 1:15–18 en 2:8–12",
        story: [
          "Tydens ’n hongersnood het ’n Israelitiese vrou met die naam Naomi saam met haar man en twee seuns na die land Moab getrek. Haar seuns het met Moabitiese vroue getrou, Orpa en Rut. Toe tref ’n ramp hulle: Naomi se man en albei haar seuns het gesterf. Naomi het met niks behalwe hartseer agtergebly nie. Sy het selfs gesê: ‘Moenie my Naomi noem nie [dit beteken ‘lieflik’]. Noem my Mara [dit beteken ‘bitter’].’",
          "Naomi het besluit om terug huis toe te gaan na Betlehem, en het vir haar skoondogters gesê om na hulle eie families terug te gaan. Orpa het huilend totsiens gesê. Maar Rut het aan Naomi vasgeklou en een van die mooiste beloftes in die Bybel gemaak: ‘Waar jy gaan, sal ek gaan, en waar jy bly, sal ek bly. Jou volk sal my volk wees en jou God my God.’ Rut, ’n vreemdeling, het gekies om aan die God van Israel te behoort.",
          "In Betlehem het die twee weduwees geen kos gehad nie. Rut het oorskietkoring agter die oesters gaan optel, iets wat God se wet aan arm mense toegelaat het. Sy het toevallig ’n land gekies wat aan Boas behoort het, ’n familielid van Naomi se man. Boas het haar raakgesien en was vriendelik. ‘Mag die Here jou beloon vir wat jy gedoen het,’ het hy gesê. ‘Mag die Here jou ryklik beloon, onder wie se vlerke jy kom skuil het.’ Hy het stilletjies vir sy werkers gesê om ekstra koring vir haar te laat val.",
          "Boas was ’n ‘losser’, ’n familielid met die reg om ’n familie in moeilikheid te red. Hy het met Rut getrou en ook na Naomi omgesien. Hulle het ’n seun gehad met die naam Obed, en Naomi het haar kleinseun met blydskap vasgehou.",
          "Die storie eindig met ’n verrassing: Obed het die oupa van koning Dawid geword. Baie geslagte later is Jesus in hierdie familie gebore. God het ’n vreemdeling uit ’n vyandige land in sy familie verwelkom en haar in die storie van Jesus ingeweef. En Jesus is ons Losser, die Een wat ons red en in God se familie inbring.",
        ],
        verse: simple("Die Here is goed vir almal; Hy is vol liefde vir alles wat Hy gemaak het.", "Psalm 145:9"),
        lessons: ["God gee om vir mense wat eensaam, hartseer en in nood is.", "God wys dikwels sy goedheid deur die goedheid van mense.", "God verwelkom almal in sy familie, en Jesus is ons Losser."],
        questions: ["Wat het Rut aan Naomi belowe?", "Hoe het Boas God se goedheid gewys?", "Wie rondom jou is eensaam of gaan deur ’n hartseer tyd? Hoe kan jy soos Rut of Boas vir hulle wees?"],
        listen: "Wees stil en vra God: ‘Met wie wil U hê moet ek hierdie week gaaf wees?’ Luister. Skryf die naam neer wat in jou gedagtes opkom.",
        prayer: ["God, dankie dat U goed is en omgee vir eensame mense.", "Troos asseblief…", "Help my om u goedheid te wys soos Rut en Boas."],
        mission: { compass: "love", text: "Doen môre iets gaaf vir iemand wat hartseer of eensaam is: ’n briefie, ’n tekening, of net om by hulle te sit." },
        journal: "Skryf Rut se belofte (‘Waar jy gaan, sal ek gaan…’) en skryf dan jou eie belofte aan God in jou eie woorde.",
      }),
    },
  },

  /* ---------------- Night 26: Naaman and the servant girl ---------------- */
  "j01-n26": {
    "2-3": {
      en: toddler({
        title: "The Little Girl Who Helped", bibleStory: "2 Kings 5",
        story: ["Naaman was a big, strong soldier. But he had sore, spotty skin.", "A little girl in his house said, ‘God’s prophet can make you better!’", "The prophet said, ‘Wash in the river seven times.’", "Splash! One, two, three, four, five, six, SEVEN!", "His skin was all better! God used a little girl to help."],
        verse: simple("God can use me, even though I am little.", "1 Timothy 4:12"),
        action: "Pretend to wash in the river and count to seven: splash, splash, splash! Then show your clean hands.",
        lessons: ["God can use me, even though I am little."],
        questions: ["Can you count to seven with me?"],
        prayer: ["Dear God,", "please use me to help others. Amen."],
      }),
      af: toddler({
        title: "Die Dogtertjie wat Gehelp Het", bibleStory: "2 Konings 5",
        story: ["Naäman was ’n groot, sterk soldaat. Maar hy het seer, kolle-vel gehad.", "’n Dogtertjie in sy huis het gesê: ‘God se profeet kan jou gesond maak!’", "Die profeet het gesê: ‘Was jou sewe keer in die rivier.’", "Plons! Een, twee, drie, vier, vyf, ses, SEWE!", "Sy vel was heeltemal gesond! God het ’n dogtertjie gebruik om te help."],
        verse: simple("God kan my gebruik, al is ek klein.", "1 Timoteus 4:12"),
        action: "Maak of jy in die rivier was en tel tot sewe: plons, plons, plons! Wys dan jou skoon hande.",
        lessons: ["God kan my gebruik, al is ek klein."],
        questions: ["Kan jy saam met my tot sewe tel?"],
        prayer: ["Liewe God,", "gebruik my asseblief om ander te help. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "A Small Voice, a Big Healing", bibleStory: "2 Kings 5", readPassage: "2 Kings 5:1–15",
        story: [
          "Naaman was the commander of the army of Aram, a powerful enemy of Israel. He was a great hero, highly respected by his king. But he had leprosy, a skin disease that had no cure and would slowly get worse.",
          "On one of their raids into Israel, the Aramean soldiers had captured a young girl, and she became a servant to Naaman’s wife. She had every reason to be bitter. She was far from her family, serving the people who had taken her. But instead she cared. She said, ‘If only my master would see the prophet who is in Samaria! He would cure him of his leprosy.’ Even far from home, she trusted God and believed He could heal.",
          "Naaman travelled to Israel with horses, chariots and expensive gifts, and stopped at the prophet Elisha’s door. Elisha didn’t even come out. He simply sent a messenger: ‘Go, wash yourself seven times in the Jordan, and your flesh will be restored.’",
          "Naaman was furious. He had expected a grand ceremony. ‘Aren’t the rivers of Damascus better than all the waters of Israel?’ He stormed away. But his servants reasoned with him: ‘If the prophet had told you to do some great thing, wouldn’t you have done it? How much more, then, when he tells you, “Wash and be cleansed”!’",
          "So Naaman humbled himself, went down to the Jordan and dipped seven times. When he came up the seventh time, his skin was restored, clean as a young boy’s. Naaman went back to Elisha and declared, ‘Now I know that there is no God in all the world except in Israel.’",
          "God is a healer, and He still heals today. He cares about our bodies as well as our hearts. And notice how this miracle began: with the faith of a girl whose name we don’t even know. God loves to use children who trust Him.",
        ],
        verse: simple("Don’t let anyone look down on you because you are young, but set an example for the believers.", "1 Timothy 4:12"),
        lessons: ["God is a healer who cares about our bodies as well as our hearts.", "God uses children who trust Him to point others to Him.", "Receiving from God takes humility: doing things His way, even when it seems too simple."],
        questions: ["Why do you think the servant girl wanted to help Naaman, even though he was her captor?", "Why was Naaman angry at first? What changed his mind?", "Who do you know who needs healing? How could you pray for them, or tell them about God?"],
        listen: "Think of someone who is sick or hurting. Ask God: ‘How do you want me to pray for them?’ Listen, then pray what you sense, with faith.",
        prayer: ["God, you are the Healer.", "I pray for… Please heal them and show them your love.", "Use me, even though I’m young, to point others to you."],
        mission: { compass: "love", text: "Pray for someone who is sick tomorrow, and if you can, tell them (or send a message) that you are praying for them." },
        journal: "Draw the servant girl. Next to her, write a few sentences about how you could be like her in your school or neighbourhood.",
      }),
      af: older({
        title: "’n Klein Stemmetjie, ’n Groot Genesing", bibleStory: "2 Konings 5", readPassage: "2 Konings 5:1–15",
        story: [
          "Naäman was die bevelvoerder van die leër van Aram, ’n sterk vyand van Israel. Hy was ’n groot held, baie gerespekteer deur sy koning. Maar hy het melaatsheid gehad, ’n velsiekte waarvoor daar geen geneesmiddel was nie en wat stadig erger sou word.",
          "Op een van hulle strooptogte in Israel het die Arameese soldate ’n jong meisie gevang, en sy het ’n diensmeisie vir Naäman se vrou geword. Sy het elke rede gehad om bitter te wees. Sy was ver van haar familie af en het die mense gedien wat haar gevat het. Maar sy het eerder omgegee. Sy het gesê: ‘As my baas maar net na die profeet in Samaria kon gaan! Hy sou hom van sy melaatsheid gesond maak.’ Selfs ver van die huis af het sy God vertrou en geglo Hy kan genees.",
          "Naäman het met perde, strydwaens en duur geskenke na Israel gereis, en voor die profeet Elisa se deur stilgehou. Elisa het nie eens uitgekom nie. Hy het net ’n boodskapper gestuur: ‘Gaan was jou sewe keer in die Jordaan, dan sal jou vel gesond word.’",
          "Naäman was woedend. Hy het ’n groot seremonie verwag. ‘Is die riviere van Damaskus nie beter as al die waters van Israel nie?’ Hy het weggestorm. Maar sy diensknegte het met hom gepraat: ‘As die profeet u gevra het om iets groots te doen, sou u dit nie gedoen het nie? Hoeveel te meer as hy net sê: “Was jou en word skoon”!’",
          "Toe het Naäman homself verootmoedig, na die Jordaan afgegaan en homself sewe keer onder die water gedompel. Toe hy die sewende keer opkom, was sy vel gesond, so skoon soos ’n jong seun s’n. Naäman het na Elisa teruggegaan en verklaar: ‘Nou weet ek dat daar geen God in die hele wêreld is behalwe in Israel nie.’",
          "God is ’n Geneser, en Hy genees vandag nog. Hy gee om vir ons liggame sowel as ons harte. En let op hoe hierdie wonderwerk begin het: met die geloof van ’n meisie wie se naam ons nie eens ken nie. God gebruik graag kinders wat Hom vertrou.",
        ],
        verse: simple("Moenie dat iemand op jou neersien omdat jy jonk is nie, maar wees ’n voorbeeld vir die gelowiges.", "1 Timoteus 4:12"),
        lessons: ["God is ’n Geneser wat omgee vir ons liggame sowel as ons harte.", "God gebruik kinders wat Hom vertrou om ander na Hom te wys.", "Om van God te ontvang vra nederigheid: om dinge op sy manier te doen, selfs as dit te eenvoudig lyk."],
        questions: ["Hoekom dink jy wou die diensmeisie Naäman help, al was hy die een wat haar gevang het?", "Hoekom was Naäman eers kwaad? Wat het hom van plan laat verander?", "Wie ken jy wat genesing nodig het? Hoe kan jy vir hulle bid, of hulle van God vertel?"],
        listen: "Dink aan iemand wat siek is of seerkry. Vra God: ‘Hoe wil U hê moet ek vir hulle bid?’ Luister, en bid dan met geloof wat jy aanvoel.",
        prayer: ["God, U is die Geneser.", "Ek bid vir… Maak hulle asseblief gesond en wys hulle u liefde.", "Gebruik my, al is ek jonk, om ander na U te wys."],
        mission: { compass: "love", text: "Bid môre vir iemand wat siek is, en as jy kan, sê vir hulle (of stuur ’n boodskap) dat jy vir hulle bid." },
        journal: "Teken die diensmeisie. Skryf langs haar ’n paar sinne oor hoe jy soos sy kan wees by jou skool of in jou buurt.",
      }),
    },
  },

  /* ---------------- Night 27: Isaiah's promise ---------------- */
  "j01-n27": {
    "2-3": {
      en: toddler({
        title: "God’s Big Promise", bibleStory: "Isaiah 9",
        story: ["God told Isaiah a secret: ‘One day a special baby will be born.’", "‘He will be called Wonderful… Mighty God… Prince of Peace!’", "God’s people waited and waited and waited.", "Do you know who that baby is? JESUS!", "God always keeps His promises."],
        verse: simple("A baby will be born to us.", "Isaiah 9:6"),
        action: "Rock a pretend baby in your arms. Then whisper the secret: ‘It’s Jesus!’",
        lessons: ["God promised to send Jesus, and He did!"],
        questions: ["Who is the special baby? (Jesus!)"],
        prayer: ["Thank you, God,", "for sending Jesus. Amen."],
      }),
      af: toddler({
        title: "God se Groot Belofte", bibleStory: "Jesaja 9",
        story: ["God het vir Jesaja ’n geheim vertel: ‘Eendag sal ’n spesiale baba gebore word.’", "‘Hy sal genoem word Wonderbaar… Magtige God… Vredevors!’", "God se mense het gewag en gewag en gewag.", "Weet jy wie daardie baba is? JESUS!", "God hou altyd sy beloftes."],
        verse: simple("’n Baba sal vir ons gebore word.", "Jesaja 9:5"),
        action: "Wieg ’n kamma-baba in jou arms. Fluister dan die geheim: ‘Dis Jesus!’",
        lessons: ["God het belowe om Jesus te stuur, en Hy het!"],
        questions: ["Wie is die spesiale baba? (Jesus!)"],
        prayer: ["Dankie, God,", "dat U Jesus gestuur het. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Clues About a Coming King", bibleStory: "Isaiah 7, 9, 53; Micah 5", readPassage: "Isaiah 9:2, 6–7",
        story: [
          "Remember the promise God made in the garden, on the very day sin entered the world? He promised that one of Eve’s descendants would crush the serpent’s head. Over the next thousands of years, God kept adding clues about this coming Rescuer, like pieces of a treasure map. Many of them came through the prophet Isaiah, about 700 years before Jesus was born.",
          "Clue one: He would be God with us. ‘The virgin will conceive and give birth to a son, and will call Him Immanuel’, which means ‘God with us’ (Isaiah 7:14). The Rescuer would not just be a messenger from God. He would be God Himself, come close.",
          "Clue two: He would be a King, and His names tell us what He is like. ‘For to us a child is born, to us a son is given… And He will be called Wonderful Counsellor, Mighty God, Everlasting Father, Prince of Peace. Of the greatness of His government and peace there will be no end’ (Isaiah 9:6–7).",
          "Clue three: He would come from a small town. The prophet Micah wrote that the ruler of Israel would come from Bethlehem, the little town of King David (Micah 5:2).",
          "Clue four, the most surprising: He would suffer for us. ‘He was pierced for our transgressions, He was crushed for our iniquities… and by His wounds we are healed’ (Isaiah 53:5). The King would also be a sacrifice, taking the punishment we deserved, in our place.",
          "God’s people waited for hundreds of years. Some gave up. But God never forgets a promise. Every one of these clues came true in one person: Jesus. Soon our trail will reach His birth. For now, remember this: God planned your rescue long before you were born, and He keeps every promise He makes.",
        ],
        verse: simple("For to us a child is born, to us a son is given. And He will be called Wonderful Counsellor, Mighty God, Everlasting Father, Prince of Peace.", "Isaiah 9:6"),
        lessons: ["God planned to send Jesus, our Rescuer, long before He was born.", "Jesus is God with us, the King whose names show what He is like.", "Jesus would suffer in our place, so that we could be forgiven and healed."],
        questions: ["Which clue about Jesus surprised you most?", "What does each of Jesus’ names in Isaiah 9:6 tell us about Him?", "Which of those names do you need most right now? Why?"],
        listen: "Read Jesus’ four names slowly: Wonderful Counsellor, Mighty God, Everlasting Father, Prince of Peace. Ask Jesus: ‘Which of these do you want to be for me this week?’ Listen.",
        prayer: ["Jesus, you are Wonderful Counsellor, Mighty God, Everlasting Father and Prince of Peace.", "This week I need you to be my…", "Thank you that God planned my rescue long ago."],
        mission: { compass: "listen", text: "Learn Isaiah 9:6 by heart this week, and tell someone what one of Jesus’ names means." },
        journal: "Draw a treasure map with four clues (Isaiah 7:14, Isaiah 9:6, Micah 5:2, Isaiah 53:5). At the X, write JESUS.",
      }),
      af: older({
        title: "Leidrade oor ’n Koning wat Kom", bibleStory: "Jesaja 7, 9, 53; Miga 5", readPassage: "Jesaja 9:1, 5–6",
        story: [
          "Onthou jy die belofte wat God in die tuin gemaak het, op die einste dag toe sonde in die wêreld gekom het? Hy het belowe dat een van Eva se nakomelinge die slang se kop sou vermorsel. Oor die volgende duisende jare het God aanhou leidrade gee oor hierdie Redder wat sou kom, soos stukke van ’n skatkaart. Baie van hulle het deur die profeet Jesaja gekom, omtrent 700 jaar voordat Jesus gebore is.",
          "Leidraad een: Hy sou God by ons wees. ‘Die maagd sal swanger word en ’n seun in die wêreld bring, en sy sal Hom Immanuel noem’, wat beteken ‘God met ons’ (Jesaja 7:14). Die Redder sou nie net ’n boodskapper van God wees nie. Hy sou God self wees, wat naby kom.",
          "Leidraad twee: Hy sou ’n Koning wees, en sy name sê vir ons hoe Hy is. ‘Want ’n Kind is vir ons gebore, ’n Seun is aan ons gegee… En Hy sal genoem word Wonderbare Raadsman, Magtige God, Ewige Vader, Vredevors. Sy heerskappy sal groot wees, en aan die vrede sal daar geen einde wees nie’ (Jesaja 9:5–6).",
          "Leidraad drie: Hy sou uit ’n klein dorpie kom. Die profeet Miga het geskryf dat die heerser van Israel uit Betlehem sou kom, die klein dorpie van koning Dawid (Miga 5:1).",
          "Leidraad vier, die verrassendste: Hy sou vir ons ly. ‘Hy is deurboor oor ons oortredinge, Hy is verbrysel oor ons sondes… en deur sy wonde is daar vir ons genesing’ (Jesaja 53:5). Die Koning sou ook ’n offer wees, wat die straf wat ons verdien het, in ons plek sou dra.",
          "God se mense het honderde jare lank gewag. Party het moed opgegee. Maar God vergeet nooit ’n belofte nie. Elkeen van hierdie leidrade het waar geword in een persoon: Jesus. Binnekort sal ons pad by sy geboorte uitkom. Onthou intussen dit: God het jou redding beplan lank voordat jy gebore is, en Hy hou elke belofte wat Hy maak.",
        ],
        verse: simple("Want ’n Kind is vir ons gebore, ’n Seun is aan ons gegee. En Hy sal genoem word Wonderbare Raadsman, Magtige God, Ewige Vader, Vredevors.", "Jesaja 9:5"),
        lessons: ["God het beplan om Jesus, ons Redder, te stuur lank voordat Hy gebore is.", "Jesus is God by ons, die Koning wie se name wys hoe Hy is.", "Jesus sou in ons plek ly, sodat ons vergewe en genees kan word."],
        questions: ["Watter leidraad oor Jesus het jou die meeste verras?", "Wat sê elkeen van Jesus se name in Jesaja 9:5 vir ons oor Hom?", "Watter een van daardie name het jy nou die meeste nodig? Hoekom?"],
        listen: "Lees Jesus se vier name stadig: Wonderbare Raadsman, Magtige God, Ewige Vader, Vredevors. Vra Jesus: ‘Watter een van hierdie wil U hierdie week vir my wees?’ Luister.",
        prayer: ["Jesus, U is Wonderbare Raadsman, Magtige God, Ewige Vader en Vredevors.", "Hierdie week het ek nodig dat U my… is.", "Dankie dat God my redding lank gelede beplan het."],
        mission: { compass: "listen", text: "Leer hierdie week Jesaja 9:5 uit jou kop, en vertel vir iemand wat een van Jesus se name beteken." },
        journal: "Teken ’n skatkaart met vier leidrade (Jesaja 7:14, Jesaja 9:5, Miga 5:1, Jesaja 53:5). Skryf JESUS by die X.",
      }),
    },
  },

  /* ---------------- Night 28: Campfire ---------------- */
  "j01-n28": {
    "2-3": {
      en: toddler({
        title: "Campfire Night",
        story: ["Well done, little explorer! Let’s sit by the campfire and remember: God gave Jonah another chance. God was in the fire. God helped brave Esther. God is kind. God used a little girl. God promised to send Jesus!"],
        game: "Splash and gulp: lay a blanket on the floor for a river. Jump across and say one thing God did. Then be a big fish and gulp Mom up!",
        lessons: [], questions: ["Who did God give a second chance to?"],
        prayer: ["Thank you, God,", "for loving me so much. Amen."],
      }),
      af: toddler({
        title: "Kampvuuraand",
        story: ["Mooi so, klein ontdekker! Kom ons sit by die kampvuur en onthou: God het vir Jona nog ’n kans gegee. God was in die vuur. God het dapper Ester gehelp. God is goed. God het ’n dogtertjie gebruik. God het belowe om Jesus te stuur!"],
        game: "Plons en sluk: lê ’n kombers op die vloer vir ’n rivier. Spring oor en sê een ding wat God gedoen het. Wees dan ’n groot vis en sluk Mamma in!",
        lessons: [], questions: ["Vir wie het God nog ’n kans gegee?"],
        prayer: ["Dankie, God,", "dat U my so baie liefhet. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Campfire Night: The River of Second Chances",
        story: ["You’ve sailed the River of Second Chances! This week God rescued a runaway prophet and forgave a whole city, stood in the fire with three faithful friends, placed a brave queen ‘for such a time as this’, welcomed a lonely foreigner into His family, healed a commander through the faith of a servant girl, and promised a coming King. Through every story runs God’s mercy: He keeps reaching out to people who don’t deserve it, and He was preparing the way for Jesus."],
        game: "Who said it? Your parent reads a quote from this week (‘Even if He does not…’, ‘Where you go I will go’, ‘For such a time as this’, ‘In my distress I called to the Lord’, ‘Now I know there is no God except in Israel’). You name who said it and why.",
        lessons: [],
        questions: ["Which second chance from this week means the most to you?", "Which person this week was the bravest? Which was the kindest?", "How did this week’s stories prepare the way for Jesus?"],
        prayer: ["God, your mercy is new every morning.", "Thank you for giving me second chances, like when…", "Thank you that you prepared the way for Jesus."],
        mission: { compass: "listen", text: "Learn Lamentations 3:22–23 by heart, and say it when you wake up tomorrow." },
        journal: "Draw a winding river. Along it, draw six small pictures, one for each story this week. At the end of the river, draw a star, because Jesus is coming!",
      }),
      af: older({
        title: "Kampvuuraand: Die Rivier van Tweede Kanse",
        story: ["Jy het met die Rivier van Tweede Kanse gevaar! Hierdie week het God ’n profeet wat weggehardloop het, gered en ’n hele stad vergewe, saam met drie getroue vriende in die vuur gestaan, ’n dapper koningin ‘vir ’n tyd soos hierdie’ op haar plek gesit, ’n eensame vreemdeling in sy familie verwelkom, ’n bevelvoerder genees deur die geloof van ’n diensmeisie, en ’n Koning belowe wat sou kom. Deur elke storie loop God se genade: Hy hou aan om uit te reik na mense wat dit nie verdien nie, en Hy het die pad vir Jesus voorberei."],
        game: "Wie het dit gesê? Jou ouer lees ’n aanhaling van hierdie week voor (‘Selfs as Hy nie…’, ‘Waar jy gaan, sal ek gaan’, ‘Vir ’n tyd soos hierdie’, ‘In my nood het ek na die Here geroep’, ‘Nou weet ek daar is geen God behalwe in Israel nie’). Jy sê wie dit gesê het en hoekom.",
        lessons: [],
        questions: ["Watter tweede kans van hierdie week beteken die meeste vir jou?", "Wie was hierdie week die dapperste? Wie was die gaafste?", "Hoe het hierdie week se stories die pad vir Jesus voorberei?"],
        prayer: ["God, u genade is elke oggend nuut.", "Dankie dat U my tweede kanse gee, soos toe…", "Dankie dat U die pad vir Jesus voorberei het."],
        mission: { compass: "listen", text: "Leer Klaagliedere 3:22–23 uit jou kop, en sê dit môre as jy wakker word." },
        journal: "Teken ’n kronkelende rivier. Teken langs dit ses klein prentjies, een vir elke storie van hierdie week. Teken ’n ster aan die einde van die rivier, want Jesus kom!",
      }),
    },
  },
};
