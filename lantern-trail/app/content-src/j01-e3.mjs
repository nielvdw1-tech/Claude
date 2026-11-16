/**
 * Journey Trail 1, Expedition 3 (Brave Hearts Mountain): ages 2–3 and 8–9, English and Afrikaans.
 * Status: DRAFT, awaiting review (see docs/CONTENT-GUIDE.md section 7).
 */
const simple = (text, refText) => ({ text, refText, wording: "simple" });
const toddler = (o) => ({ prayerStyle: "repeat", ...o });
const older = (o) => ({ prayerStyle: "own", ...o });

export default {
  /* ---------------- Night 15: Samuel hears God ---------------- */
  "j01-n15": {
    "2-3": {
      en: toddler({
        title: "Samuel, Samuel!", bibleStory: "1 Samuel 3",
        story: ["Samuel was a little boy. He lived in God’s house.", "One night, in bed, he heard a voice: ‘Samuel!’", "He ran to old Eli. ‘Here I am!’ But Eli said, ‘I didn’t call you.’", "It was God calling! So Samuel said, ‘Speak, God. I am listening.’", "God talks to children too. God talks to you!"],
        verse: simple("Speak, God. I am listening.", "1 Samuel 3:10"),
        action: "Cup your hand behind your ear and whisper: ‘I am listening.’ Then be very, very quiet for five seconds.",
        lessons: ["God talks to me, and I can listen."],
        questions: ["Can you be as quiet as a little mouse?"],
        prayer: ["Dear God,", "I am listening. Amen."],
      }),
      af: toddler({
        title: "Samuel, Samuel!", bibleStory: "1 Samuel 3",
        story: ["Samuel was ’n klein seuntjie. Hy het in God se huis gewoon.", "Een nag, in die bed, hoor hy ’n stem: ‘Samuel!’", "Hy hardloop na ou Eli. ‘Hier is ek!’ Maar Eli sê: ‘Ek het jou nie geroep nie.’", "Dit was God wat geroep het! Toe sê Samuel: ‘Praat, God. Ek luister.’", "God praat ook met kinders. God praat met jou!"],
        verse: simple("Praat, God. Ek luister.", "1 Samuel 3:10"),
        action: "Hou jou hand agter jou oor en fluister: ‘Ek luister.’ Wees dan vyf sekondes lank baie, baie stil.",
        lessons: ["God praat met my, en ek kan luister."],
        questions: ["Kan jy so stil soos ’n muisie wees?"],
        prayer: ["Liewe God,", "ek luister. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Speak, Lord, I’m Listening", bibleStory: "1 Samuel 3", readPassage: "1 Samuel 3:1–10, 19",
        story: [
          "Samuel’s mother, Hannah, had prayed for years for a child. When God gave her Samuel, she kept her promise and brought him to the house of the Lord to serve God with Eli, the old priest. So Samuel grew up in the tabernacle, helping Eli, lighting lamps and opening doors.",
          "The Bible says that in those days ‘the word of the Lord was rare’. Not many people were hearing from God, because most of them weren’t listening.",
          "One night, while Samuel was lying down near the ark of God, he heard a voice calling, ‘Samuel!’ He jumped up and ran to Eli: ‘Here I am; you called me.’ ‘I didn’t call,’ said Eli. ‘Go back to bed.’ This happened three times. Samuel didn’t recognise God’s voice yet, because he had never heard it before.",
          "Finally Eli understood that God was calling the boy. He gave Samuel wise advice: ‘If He calls you, say, “Speak, Lord, for your servant is listening.”’ So the next time God called, Samuel answered exactly that way, and God spoke to him.",
          "This story shows us three important things. First, God speaks to children, not just to grown-ups. Second, we often need to learn to recognise His voice, and wise older believers can help us, the way Eli helped Samuel. Third, God mostly speaks through His written Word, the Bible, and His Spirit also speaks to our hearts. What He says personally will always agree with the Bible.",
          "The chapter ends by saying that ‘the Lord was with Samuel as he grew up’. Samuel became a prophet who listened to God his whole life. It all began with a boy who said, ‘Speak, Lord. I’m listening.’",
        ],
        verse: simple("Speak, Lord, for your servant is listening.", "1 Samuel 3:10"),
        lessons: ["God speaks to children, and He wants to speak to you.", "We learn to recognise God’s voice over time, and wise believers can help us.", "God speaks through the Bible and by His Spirit, and He never contradicts His Word."],
        questions: ["Why didn’t Samuel recognise God’s voice at first?", "How did Eli help Samuel? Who helps you to hear God?", "What helps you to listen to God? What makes it hard?"],
        listen: "Pray Samuel’s prayer: ‘Speak, Lord, I’m listening.’ Then sit quietly for two minutes. Write down any thought, Bible verse or picture that comes to mind. Show it to your parent, and check together that it agrees with the Bible.",
        prayer: ["Speak, Lord, I’m listening.", "Help me to recognise your voice when…", "Thank you that you want to talk with me."],
        mission: { compass: "listen", text: "Tomorrow, read one verse from the Bible and ask God: ‘What do you want to say to me through this?’" },
        journal: "Start a ‘Listening page’ in your journal. Write today’s date and anything you sensed God saying during your quiet time.",
      }),
      af: older({
        title: "Praat, Here, Ek Luister", bibleStory: "1 Samuel 3", readPassage: "1 Samuel 3:1–10, 19",
        story: [
          "Samuel se ma, Hanna, het jare lank vir ’n kind gebid. Toe God vir haar Samuel gee, het sy haar belofte gehou en hom na die huis van die Here gebring om God saam met Eli, die ou priester, te dien. So het Samuel in die tabernakel grootgeword, waar hy vir Eli gehelp, lampe aangesteek en deure oopgemaak het.",
          "Die Bybel sê dat in daardie dae ‘die woord van die Here skaars was’. Nie baie mense het van God gehoor nie, want die meeste van hulle het nie geluister nie.",
          "Een nag, terwyl Samuel naby die ark van God gelê het, het hy ’n stem hoor roep: ‘Samuel!’ Hy het opgespring en na Eli gehardloop: ‘Hier is ek; u het my geroep.’ ‘Ek het nie geroep nie,’ het Eli gesê. ‘Gaan terug bed toe.’ Dit het drie keer gebeur. Samuel het God se stem nog nie herken nie, want hy het dit nog nooit gehoor nie.",
          "Eindelik het Eli verstaan dat God die seun roep. Hy het vir Samuel wyse raad gegee: ‘As Hy jou roep, sê: “Praat, Here, u dienaar luister.”’ Die volgende keer toe God roep, het Samuel presies so geantwoord, en God het met hom gepraat.",
          "Hierdie storie wys ons drie belangrike dinge. Eerstens: God praat met kinders, nie net met grootmense nie. Tweedens: ons moet dikwels leer om sy stem te herken, en wyse ouer gelowiges kan ons help, soos Eli vir Samuel gehelp het. Derdens: God praat meestal deur sy geskrewe Woord, die Bybel, en sy Gees praat ook met ons harte. Wat Hy persoonlik sê, sal altyd ooreenstem met die Bybel.",
          "Die hoofstuk eindig deur te sê dat ‘die Here met Samuel was terwyl hy grootgeword het’. Samuel het ’n profeet geword wat sy hele lewe lank na God geluister het. Dit het alles begin met ’n seun wat gesê het: ‘Praat, Here. Ek luister.’",
        ],
        verse: simple("Praat, Here, u dienaar luister.", "1 Samuel 3:10"),
        lessons: ["God praat met kinders, en Hy wil met jou praat.", "Ons leer mettertyd om God se stem te herken, en wyse gelowiges kan ons help.", "God praat deur die Bybel en deur sy Gees, en Hy sê nooit iets teen sy Woord nie."],
        questions: ["Hoekom het Samuel eers nie God se stem herken nie?", "Hoe het Eli vir Samuel gehelp? Wie help jou om God te hoor?", "Wat help jou om na God te luister? Wat maak dit moeilik?"],
        listen: "Bid Samuel se gebed: ‘Praat, Here, ek luister.’ Sit dan twee minute lank stil. Skryf enige gedagte, Bybelvers of prentjie neer wat in jou gedagtes opkom. Wys dit vir jou ouer, en kyk saam of dit met die Bybel ooreenstem.",
        prayer: ["Praat, Here, ek luister.", "Help my om u stem te herken wanneer…", "Dankie dat U met my wil praat."],
        mission: { compass: "listen", text: "Lees môre een vers uit die Bybel en vra God: ‘Wat wil U deur hierdie vers vir my sê?’" },
        journal: "Begin ’n ‘Luisterblad’ in jou joernaal. Skryf vandag se datum neer en enigiets wat jy aangevoel het God sê in jou stil tyd.",
      }),
    },
  },

  /* ---------------- Night 16: David chosen ---------------- */
  "j01-n16": {
    "2-3": {
      en: toddler({
        title: "God Sees My Heart", bibleStory: "1 Samuel 16",
        story: ["God said, ‘One of Jesse’s boys will be king.’", "The big, tall brothers came. But God said, ‘Not him… not him… not him.’", "The littlest one, David, was out with the sheep.", "God said, ‘David is the one! I see his heart. He loves me.’", "God sees your heart too. God loves you!"],
        verse: simple("God looks at the heart.", "1 Samuel 16:7"),
        action: "Stand up tall like the big brothers, then crouch down small like little David. Put your hand on your heart: ‘God sees my heart!’",
        lessons: ["God sees my heart, and He loves me."],
        questions: ["Where is your heart? Can you put your hand on it?"],
        prayer: ["Dear God,", "please give me a heart that loves you. Amen."],
      }),
      af: toddler({
        title: "God Sien My Hart", bibleStory: "1 Samuel 16",
        story: ["God het gesê: ‘Een van Isai se seuns sal koning wees.’", "Die groot, lang broers het gekom. Maar God het gesê: ‘Nie hy nie… nie hy nie… nie hy nie.’", "Die kleinste een, Dawid, was buite by die skape.", "God het gesê: ‘Dawid is die een! Ek sien sy hart. Hy is lief vir My.’", "God sien jou hart ook. God is lief vir jou!"],
        verse: simple("God kyk na die hart.", "1 Samuel 16:7"),
        action: "Staan lank soos die groot broers, en hurk dan klein soos klein Dawid. Sit jou hand op jou hart: ‘God sien my hart!’",
        lessons: ["God sien my hart, en Hy is lief vir my."],
        questions: ["Waar is jou hart? Kan jy jou hand daarop sit?"],
        prayer: ["Liewe God,", "gee my asseblief ’n hart wat U liefhet. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "The Heart God Sees", bibleStory: "1 Samuel 16", readPassage: "1 Samuel 16:1–13",
        story: [
          "Israel’s first king, Saul, was tall and impressive, but he stopped obeying God. So God sent the prophet Samuel, now an old man, to Bethlehem, to the family of a man called Jesse. ‘I have chosen one of his sons to be king,’ God said.",
          "Jesse’s sons came in one by one. First came Eliab, the eldest, tall and strong. Samuel thought, ‘Surely this is the one!’ But God said, ‘Do not look at his appearance or his height. The Lord does not look at the things people look at. People look at the outward appearance, but the Lord looks at the heart.’",
          "Seven sons walked past, and God said no to every one. Samuel was puzzled. ‘Are these all the sons you have?’ Jesse answered, ‘There is still the youngest. He is looking after the sheep.’ Nobody had even thought to invite David!",
          "They sent for him, and the Lord said, ‘Rise and anoint him; this is the one.’ Samuel poured oil on David’s head in front of his brothers, and the Bible says, ‘From that day on the Spirit of the Lord came powerfully upon David.’",
          "What did God see in David’s heart? Out in the fields, alone with the sheep, David had been getting to know God. He sang to Him, trusted Him and loved Him. Later the Bible calls David ‘a man after God’s own heart’. David wasn’t perfect; he made some big mistakes later on. But his heart kept turning back to God.",
          "God still looks at hearts today. He isn’t impressed by how tall, clever, popular or good-looking you are. He sees the real you, on the inside, and He loves you. And when you belong to Jesus, His Spirit lives in you, just as He came upon David.",
        ],
        verse: simple("People look at the outward appearance, but the Lord looks at the heart.", "1 Samuel 16:7"),
        lessons: ["God looks at the heart, not at outward appearance.", "Time alone with God, like David with his sheep, grows a heart that loves Him.", "God’s Spirit empowers the people He chooses, and lives in everyone who follows Jesus."],
        questions: ["Why did Samuel think Eliab would be the king?", "What do you think David did out in the fields that grew his heart for God?", "How do you sometimes judge people by how they look? How could you look at their hearts instead?"],
        listen: "Be still and ask God: ‘What do you see when you look at my heart?’ Listen. His answer will be truthful but always loving. Write down what you sense.",
        prayer: ["Lord, thank you that you see my heart.", "Make my heart like David’s: a heart that loves you and…", "Fill me with your Holy Spirit."],
        mission: { compass: "love", text: "Tomorrow, look out for someone who is often overlooked, like David was, and include them." },
        journal: "Draw a big heart. Inside it, write what you want God to find there. Outside it, write things people usually notice about you.",
      }),
      af: older({
        title: "Die Hart wat God Sien", bibleStory: "1 Samuel 16", readPassage: "1 Samuel 16:1–13",
        story: [
          "Israel se eerste koning, Saul, was lank en indrukwekkend, maar hy het opgehou om God te gehoorsaam. Toe stuur God die profeet Samuel, nou ’n ou man, na Betlehem, na die familie van ’n man met die naam Isai. ‘Ek het een van sy seuns gekies om koning te wees,’ het God gesê.",
          "Isai se seuns het een vir een ingekom. Eerste was Eliab, die oudste, lank en sterk. Samuel het gedink: ‘Dit is sekerlik hy!’ Maar God het gesê: ‘Moenie na sy voorkoms of sy lengte kyk nie. Die Here kyk nie na wat mense na kyk nie. Mense kyk na die buitekant, maar die Here kyk na die hart.’",
          "Sewe seuns het verbygestap, en God het vir elkeen nee gesê. Samuel was verward. ‘Is dit al die seuns wat jy het?’ Isai het geantwoord: ‘Daar is nog die jongste. Hy pas die skape op.’ Niemand het eers daaraan gedink om Dawid te nooi nie!",
          "Hulle het hom laat roep, en die Here het gesê: ‘Staan op en salf hom; dit is hy.’ Samuel het olie op Dawid se kop gegooi voor sy broers, en die Bybel sê: ‘Van daardie dag af het die Gees van die Here kragtig oor Dawid gekom.’",
          "Wat het God in Dawid se hart gesien? Buite in die veld, alleen by die skape, het Dawid vir God leer ken. Hy het vir Hom gesing, Hom vertrou en Hom liefgehad. Later noem die Bybel Dawid ‘’n man na God se hart’. Dawid was nie volmaak nie; hy het later groot foute gemaak. Maar sy hart het altyd weer na God teruggedraai.",
          "God kyk vandag nog na harte. Hy is nie beïndruk deur hoe lank, slim, gewild of mooi jy is nie. Hy sien die regte jy, aan die binnekant, en Hy is lief vir jou. En as jy aan Jesus behoort, woon sy Gees in jou, net soos Hy oor Dawid gekom het.",
        ],
        verse: simple("Mense kyk na die buitekant, maar die Here kyk na die hart.", "1 Samuel 16:7"),
        lessons: ["God kyk na die hart, nie na die buitekant nie.", "Tyd alleen met God, soos Dawid by sy skape, laat ’n hart groei wat Hom liefhet.", "God se Gees gee krag aan die mense wat Hy kies, en woon in almal wat Jesus volg."],
        questions: ["Hoekom het Samuel gedink Eliab sal die koning wees?", "Wat dink jy het Dawid in die veld gedoen wat sy hart vir God laat groei het?", "Hoe oordeel jy soms mense op grond van hoe hulle lyk? Hoe kan jy eerder na hulle harte kyk?"],
        listen: "Wees stil en vra God: ‘Wat sien U as U na my hart kyk?’ Luister. Sy antwoord sal eerlik wees, maar altyd liefdevol. Skryf neer wat jy aanvoel.",
        prayer: ["Here, dankie dat U my hart sien.", "Maak my hart soos Dawid s’n: ’n hart wat U liefhet en…", "Vul my met u Heilige Gees."],
        mission: { compass: "love", text: "Kyk môre uit vir iemand wat dikwels oor die hoof gesien word, soos Dawid, en sluit hulle in." },
        journal: "Teken ’n groot hart. Skryf daarin wat jy wil hê God daar moet kry. Skryf buite die hart dinge wat mense gewoonlik van jou raaksien.",
      }),
    },
  },

  /* ---------------- Night 17: David and Goliath ---------------- */
  "j01-n17": {
    "2-3": {
      en: toddler({
        title: "David and the Giant", bibleStory: "1 Samuel 17",
        story: ["There was a giant called Goliath. He was big, big, BIG!", "‘Who will fight me?’ he shouted. Everyone was scared.", "But little David said, ‘God is with me!’", "David took his sling and a little stone. Swing, swing… whoosh!", "The giant fell down. God made David brave!"],
        verse: simple("Be brave! God is with you.", "Joshua 1:9"),
        action: "Stand on your tiptoes and stretch up high like a giant. Then swing a pretend sling: swing, swing, whoosh!",
        lessons: ["God makes me brave. He is with me."],
        questions: ["What makes you feel scared? God is with you!"],
        prayer: ["Dear God,", "please make me brave. Amen."],
      }),
      af: toddler({
        title: "Dawid en die Reus", bibleStory: "1 Samuel 17",
        story: ["Daar was ’n reus met die naam Goliat. Hy was groot, groot, GROOT!", "‘Wie sal teen my veg?’ het hy geskree. Almal was bang.", "Maar klein Dawid het gesê: ‘God is by my!’", "Dawid het sy slinger en ’n klein klippie gevat. Swaai, swaai… woesj!", "Die reus het omgeval. God het Dawid dapper gemaak!"],
        verse: simple("Wees dapper! God is by jou.", "Josua 1:9"),
        action: "Staan op jou tone en rek hoog soos ’n reus. Swaai dan ’n kamma-slinger: swaai, swaai, woesj!",
        lessons: ["God maak my dapper. Hy is by my."],
        questions: ["Wat maak jou bang? God is by jou!"],
        prayer: ["Liewe God,", "maak my asseblief dapper. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "In the Name of the Lord", bibleStory: "1 Samuel 17", readPassage: "1 Samuel 17:32–50",
        story: [
          "The Philistine army had a champion called Goliath. He was nearly three metres tall, and his armour alone weighed about as much as a grown man. For forty days, morning and evening, he stood in the valley and shouted insults at Israel and at Israel’s God: ‘Choose a man and have him come down to me!’ King Saul and all his soldiers were terrified.",
          "Young David arrived with food for his older brothers and heard the giant’s challenge. He was shocked, not by Goliath’s size, but by his words. ‘Who is this man that he should defy the armies of the living God?’",
          "David went to King Saul. ‘Let no one lose heart. I will fight him.’ Saul laughed: ‘You’re only a boy!’ But David explained that, while looking after his father’s sheep, he had fought off a lion and a bear. ‘The Lord who rescued me from the paw of the lion and the bear will rescue me from this Philistine.’ David’s courage came from remembering what God had already done.",
          "Saul gave David his own armour, but it was far too big. So David took only his shepherd’s staff, his sling and five smooth stones from a stream. Goliath sneered at him. But David answered with words full of faith: ‘You come against me with sword and spear, but I come against you in the name of the Lord Almighty. The battle is the Lord’s.’",
          "David ran toward the giant, swung his sling, and the stone struck Goliath on the forehead. The giant fell face down. Israel won the victory that day.",
          "Faith is not pretending a problem is small. David knew Goliath was huge. Faith is knowing that God is bigger. David spoke what God had said, not what the giant said. When we face ‘giants’ of fear, bullying or problems, we can do the same: remember what God has done, speak what He says, and go forward in His name.",
        ],
        verse: simple("Be strong and courageous. The Lord your God will be with you wherever you go.", "Joshua 1:9"),
        lessons: ["Our courage comes from knowing that God is bigger than any ‘giant’.", "Remembering what God has already done builds our faith for today.", "We can speak what God says about our problems, not what our fears say."],
        questions: ["Where did David’s courage come from?", "What did David say to Goliath? Why were those words full of faith?", "What is a ‘giant’ in your life? What does God say about it?"],
        listen: "Bring your ‘giant’ to God. Ask: ‘Lord, what do you say about this?’ Listen quietly, then find a Bible verse with your parent that answers your fear.",
        prayer: ["Lord, you are bigger than any giant.", "I bring you my giant: …", "Thank you that I can face it in your name."],
        mission: { compass: "trust", text: "Write tonight’s verse (Joshua 1:9) on a card and say it out loud tomorrow when you face something scary." },
        journal: "Make two lists: ‘What the giant says’ and ‘What God says’. Which list will you choose to believe?",
      }),
      af: older({
        title: "In die Naam van die Here", bibleStory: "1 Samuel 17", readPassage: "1 Samuel 17:32–50",
        story: [
          "Die Filistynse leër het ’n kampvegter met die naam Goliat gehad. Hy was amper drie meter lank, en net sy wapenrusting was omtrent so swaar soos ’n grootmens. Veertig dae lank, soggens en saans, het hy in die vallei gestaan en Israel en Israel se God uitgeskel: ‘Kies ’n man en laat hom na my toe afkom!’ Koning Saul en al sy soldate was doodbang.",
          "Die jong Dawid het met kos vir sy ouer broers aangekom en die reus se uitdaging gehoor. Hy was geskok, nie oor Goliat se grootte nie, maar oor sy woorde. ‘Wie is hierdie man dat hy die leër van die lewende God uitdaag?’",
          "Dawid het na koning Saul gegaan. ‘Laat niemand moed verloor nie. Ek sal teen hom veg.’ Saul het gelag: ‘Jy is net ’n seun!’ Maar Dawid het verduidelik dat hy, terwyl hy sy pa se skape opgepas het, teen ’n leeu en ’n beer geveg het. ‘Die Here wat my uit die klou van die leeu en die beer gered het, sal my uit die hand van hierdie Filistyn red.’ Dawid se moed het gekom van onthou wat God al gedoen het.",
          "Saul het vir Dawid sy eie wapenrusting gegee, maar dit was heeltemal te groot. Toe het Dawid net sy skaapwagterstok, sy slinger en vyf gladde klippe uit ’n stroompie gevat. Goliat het vir hom gespot. Maar Dawid het geantwoord met woorde vol geloof: ‘Jy kom na my met ’n swaard en ’n spies, maar ek kom na jou in die Naam van die Here, die Almagtige. Die geveg behoort aan die Here.’",
          "Dawid het na die reus toe gehardloop, sy slinger geswaai, en die klip het Goliat teen die voorkop getref. Die reus het op sy gesig neergeval. Israel het daardie dag die oorwinning behaal.",
          "Geloof is nie om te maak of ’n probleem klein is nie. Dawid het geweet Goliat is reusagtig. Geloof is om te weet dat God groter is. Dawid het gesê wat God gesê het, nie wat die reus gesê het nie. As ons ‘reuse’ van vrees, boelies of probleme teëkom, kan ons dieselfde doen: onthou wat God gedoen het, sê wat Hy sê, en gaan vorentoe in sy Naam.",
        ],
        verse: simple("Wees sterk en moedig. Die Here jou God is by jou oral waar jy gaan.", "Josua 1:9"),
        lessons: ["Ons moed kom daarvan om te weet dat God groter is as enige ‘reus’.", "As ons onthou wat God al gedoen het, groei ons geloof vir vandag.", "Ons kan sê wat God oor ons probleme sê, nie wat ons vrese sê nie."],
        questions: ["Waar het Dawid se moed vandaan gekom?", "Wat het Dawid vir Goliat gesê? Hoekom was daardie woorde vol geloof?", "Wat is ’n ‘reus’ in jou lewe? Wat sê God daaroor?"],
        listen: "Bring jou ‘reus’ na God. Vra: ‘Here, wat sê U hieroor?’ Luister stil, en soek dan saam met jou ouer ’n Bybelvers wat jou vrees antwoord.",
        prayer: ["Here, U is groter as enige reus.", "Ek bring vir U my reus: …", "Dankie dat ek dit in u Naam kan aanpak."],
        mission: { compass: "trust", text: "Skryf vanaand se vers (Josua 1:9) op ’n kaartjie en sê dit môre hardop as jy iets bangmakends teëkom." },
        journal: "Maak twee lyste: ‘Wat die reus sê’ en ‘Wat God sê’. Watter lys gaan jy kies om te glo?",
      }),
    },
  },

  /* ---------------- Night 18: Psalm 23 ---------------- */
  "j01-n18": {
    "2-3": {
      en: toddler({
        title: "My Shepherd", bibleStory: "Psalm 23",
        story: ["David looked after his sheep. He loved them.", "He gave them green grass to eat. Munch, munch!", "He gave them cool water to drink. Slurp!", "When it was dark, he kept them safe.", "David sang: ‘God is my shepherd. He looks after me!’"],
        verse: simple("The Lord is my shepherd.", "Psalm 23:1"),
        action: "Crawl like a little sheep and say ‘Baa!’ Then snuggle up close to your shepherd (that’s Mom!).",
        lessons: ["God looks after me, like a shepherd looks after his sheep."],
        questions: ["What does a sheep say?"],
        prayer: ["Thank you, God,", "for looking after me. Amen."],
      }),
      af: toddler({
        title: "My Herder", bibleStory: "Psalm 23",
        story: ["Dawid het na sy skape gekyk. Hy was lief vir hulle.", "Hy het vir hulle groen gras gegee om te eet. Kou, kou!", "Hy het vir hulle koel water gegee om te drink. Slurp!", "As dit donker was, het hy hulle veilig gehou.", "Dawid het gesing: ‘God is my herder. Hy kyk na my!’"],
        verse: simple("Die Here is my herder.", "Psalm 23:1"),
        action: "Kruip soos ’n klein skapie en sê ‘Mê!’ Kruip dan styf teen jou herder aan (dis Mamma!).",
        lessons: ["God kyk na my, soos ’n herder na sy skape kyk."],
        questions: ["Wat sê ’n skaap?"],
        prayer: ["Dankie, God,", "dat U na my kyk. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "The Shepherd Who Walks With Me", bibleStory: "Psalm 23", readPassage: "Psalm 23",
        story: [
          "Long before he became king, David spent his days and nights in the fields near Bethlehem looking after sheep. He knew exactly what sheep need: green pasture to eat, quiet water to drink (sheep are scared of rushing streams), protection from wolves, and someone to lead them, because sheep easily wander off and get lost.",
          "One day David realised something wonderful: ‘That is exactly what God is to me!’ So he wrote a song that people all over the world still pray today: Psalm 23.",
          "‘The Lord is my shepherd; I lack nothing.’ David doesn’t say ‘a shepherd’, but ‘my shepherd’. This is personal. God doesn’t just look after the world in general; He looks after you by name.",
          "‘He makes me lie down in green pastures, He leads me beside quiet waters, He refreshes my soul.’ God gives rest when we are tired, peace when we are anxious, and new strength when we feel empty inside.",
          "‘Even though I walk through the darkest valley, I will fear no evil, for you are with me.’ Notice that David doesn’t say God will keep us out of every dark valley. Sometimes hard things happen. But we never walk through them alone. The Shepherd walks right next to us.",
          "Hundreds of years later, Jesus said, ‘I am the good shepherd. The good shepherd lays down His life for the sheep.’ Jesus is the Shepherd David sang about, and He loved His sheep so much that He died for them. Because of Him, the psalm ends with a promise for every child of God: ‘I will dwell in the house of the Lord forever.’",
        ],
        verse: simple("The Lord is my shepherd; I lack nothing.", "Psalm 23:1"),
        lessons: ["God cares for me personally, like a shepherd for his own sheep.", "Even in dark and hard times, God walks with me.", "Jesus is the Good Shepherd who gave His life for His sheep."],
        questions: ["What do sheep need from a shepherd?", "What is the ‘darkest valley’ in Psalm 23? Does God promise we will never go through one?", "Which line of Psalm 23 do you need most this week? Why?"],
        listen: "Read Psalm 23 slowly, out loud. Stop at the line that stands out to you most. Ask the Good Shepherd: ‘Why did you want me to notice this line?’ Listen quietly.",
        prayer: ["Jesus, you are my Good Shepherd.", "Lead me this week in…", "Thank you that you walk with me, even in dark valleys."],
        mission: { compass: "listen", text: "Learn Psalm 23:1–3 by heart this week. Say it before you sleep tomorrow." },
        journal: "Draw yourself as a sheep in Psalm 23: in a green field, by quiet water, or in a dark valley with the Shepherd beside you. Which picture fits your life right now?",
      }),
      af: older({
        title: "Die Herder wat saam met My Loop", bibleStory: "Psalm 23", readPassage: "Psalm 23",
        story: [
          "Lank voordat hy koning geword het, het Dawid dag en nag in die veld naby Betlehem na skape gekyk. Hy het presies geweet wat skape nodig het: groen weiding om te eet, stil water om te drink (skape is bang vir water wat vinnig vloei), beskerming teen wolwe, en iemand om hulle te lei, want skape dwaal maklik weg en raak verdwaal.",
          "Eendag het Dawid iets wonderliks besef: ‘Dit is presies wat God vir my is!’ Toe skryf hy ’n lied wat mense oor die hele wêreld vandag nog bid: Psalm 23.",
          "‘Die Here is my herder; ek kort niks nie.’ Dawid sê nie ‘’n herder’ nie, maar ‘my herder’. Dit is persoonlik. God kyk nie net in die algemeen na die wêreld nie; Hy kyk na jou, op jou naam.",
          "‘Hy laat my in groen weivelde lê, Hy lei my na waters waar daar rus is, Hy gee my nuwe krag.’ God gee rus as ons moeg is, vrede as ons bekommerd is, en nuwe krag as ons leeg voel binne-in.",
          "‘Selfs al gaan ek deur die donkerste dal, sal ek nie bang wees nie, want U is by my.’ Let op dat Dawid nie sê God sal ons uit elke donker dal hou nie. Soms gebeur moeilike dinge. Maar ons loop nooit alleen daardeur nie. Die Herder loop reg langs ons.",
          "Honderde jare later het Jesus gesê: ‘Ek is die goeie Herder. Die goeie Herder gee sy lewe vir die skape.’ Jesus is die Herder van wie Dawid gesing het, en Hy was so lief vir sy skape dat Hy vir hulle gesterf het. Danksy Hom eindig die psalm met ’n belofte vir elke kind van God: ‘Ek sal vir altyd in die huis van die Here woon.’",
        ],
        verse: simple("Die Here is my herder; ek kort niks nie.", "Psalm 23:1"),
        lessons: ["God sorg persoonlik vir my, soos ’n herder vir sy eie skape.", "Selfs in donker en moeilike tye loop God saam met my.", "Jesus is die goeie Herder wat sy lewe vir sy skape gegee het."],
        questions: ["Wat het skape van ’n herder nodig?", "Wat is die ‘donkerste dal’ in Psalm 23? Belowe God dat ons nooit deur een sal gaan nie?", "Watter reël van Psalm 23 het jy hierdie week die meeste nodig? Hoekom?"],
        listen: "Lees Psalm 23 stadig en hardop. Stop by die reël wat die meeste vir jou uitstaan. Vra die goeie Herder: ‘Hoekom wou U hê ek moet hierdie reël raaksien?’ Luister stil.",
        prayer: ["Jesus, U is my goeie Herder.", "Lei my hierdie week in…", "Dankie dat U saam met my loop, selfs in donker dale."],
        mission: { compass: "listen", text: "Leer hierdie week Psalm 23:1–3 uit jou kop. Sê dit môreaand voor jy gaan slaap." },
        journal: "Teken jouself as ’n skaap in Psalm 23: in ’n groen veld, by stil water, of in ’n donker dal met die Herder langs jou. Watter prentjie pas nou by jou lewe?",
      }),
    },
  },

  /* ---------------- Night 19: Elijah on Mount Carmel ---------------- */
  "j01-n19": {
    "2-3": {
      en: toddler({
        title: "Fire from Heaven", bibleStory: "1 Kings 18",
        story: ["Some people prayed to a pretend god. He could not hear them!", "They shouted and jumped. Nothing happened.", "Then Elijah prayed to the real God.", "WHOOSH! God sent fire from the sky!", "Everybody said, ‘The Lord is God!’ God hears when we pray."],
        verse: simple("The Lord is God!", "1 Kings 18:39"),
        action: "Jump and shout like the people, then sit very still and fold your hands to pray like Elijah. Then throw your arms up: WHOOSH!",
        lessons: ["God is real, and He hears me when I pray."],
        questions: ["Does God hear us when we whisper a prayer?"],
        prayer: ["Dear God,", "you are real, and you hear me. Amen."],
      }),
      af: toddler({
        title: "Vuur uit die Hemel", bibleStory: "1 Konings 18",
        story: ["Party mense het tot ’n kamma-god gebid. Hy kon hulle nie hoor nie!", "Hulle het geskree en gespring. Niks het gebeur nie.", "Toe bid Elia tot die regte God.", "WOESJ! God het vuur uit die lug gestuur!", "Almal het gesê: ‘Die Here is God!’ God hoor as ons bid."],
        verse: simple("Die Here is God!", "1 Konings 18:39"),
        action: "Spring en skree soos die mense, sit dan baie stil en vou jou hande om te bid soos Elia. Gooi dan jou arms op: WOESJ!",
        lessons: ["God is regtig, en Hy hoor my as ek bid."],
        questions: ["Hoor God ons as ons ’n gebed fluister?"],
        prayer: ["Liewe God,", "U is regtig, en U hoor my. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "The God Who Answers by Fire", bibleStory: "1 Kings 18", readPassage: "1 Kings 18:20–39",
        story: [
          "King Ahab and Queen Jezebel had led Israel into worshipping Baal, a made-up god of rain and storms. As a warning, God’s prophet Elijah had announced that no rain would fall, and for three and a half years the land was dry and hungry. Still the people couldn’t decide whom to follow.",
          "So Elijah called everyone to Mount Carmel. ‘How long will you waver between two opinions? If the Lord is God, follow Him; but if Baal is God, follow him.’ He set up a contest: each side would prepare a sacrifice on an altar, but light no fire. ‘The god who answers by fire, He is God.’",
          "The 450 prophets of Baal went first. From morning until noon they shouted, ‘Baal, answer us!’ They danced around their altar and even cut themselves. Elijah teased them: ‘Shout louder! Maybe he’s asleep, or busy!’ But there was no answer. No one paid attention. Baal wasn’t real.",
          "Then Elijah repaired the broken altar of the Lord. To make the miracle impossible to doubt, he had twelve large jars of water poured over the sacrifice until the wood was soaked and the trench around it was full. Then Elijah prayed a simple prayer: ‘Lord, let it be known today that you are God… Answer me, so these people will know that you are turning their hearts back again.’",
          "Fire fell from heaven and burned up the sacrifice, the wood, the stones, the soil, and even licked up the water in the trench! The people fell on their faces and cried, ‘The Lord, He is God!’ Soon afterwards, Elijah prayed again, and the rain came.",
          "James 5:16 says that ‘the prayer of a righteous person is powerful and effective’, and points to Elijah as an example of an ordinary person who prayed with faith. God doesn’t need us to shout or perform. He is real, He hears, and He answers prayer in His way and His time.",
        ],
        verse: simple("The Lord, He is God! The Lord, He is God!", "1 Kings 18:39"),
        lessons: ["There is only one true and living God. Idols and made-up gods cannot hear or answer.", "God answers prayer: He hears simple prayers made with faith.", "God wants hearts that follow Him fully, not ones that waver between two choices."],
        questions: ["Why did Elijah pour water over his altar?", "What was the difference between how the prophets of Baal prayed and how Elijah prayed?", "Is there something you are ‘wavering’ about? What would it look like to follow God fully?"],
        listen: "Pray a simple, honest prayer about something that matters to you. Then sit quietly and ask: ‘Lord, how do you want to answer this?’ Listen, and remember that God sometimes answers ‘yes’, ‘wait’ or ‘I have something better’.",
        prayer: ["Lord, you are the one true God, and you hear me.", "Tonight I bring you…", "I believe you will answer in your way and your time."],
        mission: { compass: "talk", text: "Start a prayer list. Write down one thing you are praying for, and check back in a few weeks to see how God answered." },
        journal: "Write a short, honest prayer, like Elijah’s, in your journal. Leave space underneath to write how God answers.",
      }),
      af: older({
        title: "Die God wat met Vuur Antwoord", bibleStory: "1 Konings 18", readPassage: "1 Konings 18:20–39",
        story: [
          "Koning Agab en koningin Isebel het Israel gelei om Baal te aanbid, ’n opgemaakte god van reën en storms. As ’n waarskuwing het God se profeet Elia aangekondig dat daar geen reën sou val nie, en drie en ’n half jaar lank was die land droog en honger. Tog kon die mense nie besluit wie om te volg nie.",
          "Toe roep Elia almal na die berg Karmel. ‘Hoe lank gaan julle nog tussen twee keuses hink? As die Here God is, volg Hom; maar as Baal God is, volg hom.’ Hy het ’n kompetisie gereël: elke kant sou ’n offer op ’n altaar voorberei, maar geen vuur aansteek nie. ‘Die god wat met vuur antwoord, Hy is God.’",
          "Die 450 profete van Baal het eerste gegaan. Van die oggend tot middag het hulle geskree: ‘Baal, antwoord ons!’ Hulle het om hulle altaar gedans en selfs hulleself gesny. Elia het hulle geterg: ‘Skree harder! Dalk slaap hy, of hy is besig!’ Maar daar was geen antwoord nie. Niemand het ag geslaan nie. Baal was nie regtig nie.",
          "Toe het Elia die stukkende altaar van die Here herstel. Om die wonderwerk onmoontlik te maak om aan te twyfel, het hy twaalf groot kanne water oor die offer laat gooi totdat die hout papnat was en die sloot rondom vol was. Toe bid Elia ’n eenvoudige gebed: ‘Here, laat dit vandag bekend word dat U God is… Antwoord my, sodat hierdie mense kan weet dat U hulle harte weer na U toe terugdraai.’",
          "Vuur het uit die hemel geval en die offer, die hout, die klippe, die grond en selfs die water in die sloot verbrand! Die mense het op hulle gesigte geval en uitgeroep: ‘Die Here, Hy is God!’ Kort daarna het Elia weer gebid, en die reën het gekom.",
          "Jakobus 5:16 sê dat ‘die gebed van ’n regverdige mens baie krag het’, en wys na Elia as ’n voorbeeld van ’n gewone mens wat met geloof gebid het. God het nie nodig dat ons skree of ’n vertoning lewer nie. Hy is regtig, Hy hoor, en Hy antwoord gebed op sy manier en op sy tyd.",
        ],
        verse: simple("Die Here, Hy is God! Die Here, Hy is God!", "1 Konings 18:39"),
        lessons: ["Daar is net een ware en lewende God. Afgode en opgemaakte gode kan nie hoor of antwoord nie.", "God antwoord gebed: Hy hoor eenvoudige gebede wat met geloof gebid word.", "God wil harte hê wat Hom heeltemal volg, nie harte wat tussen twee keuses hink nie."],
        questions: ["Hoekom het Elia water oor sy altaar gegooi?", "Wat was die verskil tussen hoe die profete van Baal gebid het en hoe Elia gebid het?", "Is daar iets waaroor jy ‘hink’? Hoe sal dit lyk om God heeltemal te volg?"],
        listen: "Bid ’n eenvoudige, eerlike gebed oor iets wat vir jou saak maak. Sit dan stil en vra: ‘Here, hoe wil U dit antwoord?’ Luister, en onthou dat God soms ‘ja’, ‘wag’ of ‘Ek het iets beters’ antwoord.",
        prayer: ["Here, U is die een ware God, en U hoor my.", "Vanaand bring ek vir U…", "Ek glo U sal op u manier en op u tyd antwoord."],
        mission: { compass: "talk", text: "Begin ’n gebedslys. Skryf een ding neer waarvoor jy bid, en kyk oor ’n paar weke hoe God geantwoord het." },
        journal: "Skryf ’n kort, eerlike gebed soos Elia s’n in jou joernaal. Laat plek daaronder om te skryf hoe God antwoord.",
      }),
    },
  },

  /* ---------------- Night 20: Daniel and the lions ---------------- */
  "j01-n20": {
    "2-3": {
      en: toddler({
        title: "Daniel and the Lions", bibleStory: "Daniel 6",
        story: ["Daniel loved God. He prayed every day by his window.", "Some men made a bad rule: ‘No praying to God!’", "But Daniel still prayed. So they put him with the lions. ROAR!", "God sent an angel to shut the lions’ mouths. Snap!", "Daniel was safe. God was with him all night!"],
        verse: simple("My God shut the lions’ mouths.", "Daniel 6:22"),
        action: "Roar like a big lion. Then snap your hands shut like the lions’ mouths, and fold your hands to pray like Daniel.",
        lessons: ["God is always with me, everywhere."],
        questions: ["Where can we talk to God? (Everywhere!)"],
        prayer: ["Dear God,", "thank you for being with me. Amen."],
      }),
      af: toddler({
        title: "Daniël en die Leeus", bibleStory: "Daniël 6",
        story: ["Daniël was lief vir God. Hy het elke dag by sy venster gebid.", "’n Paar mans het ’n slegte reël gemaak: ‘Geen bid tot God nie!’", "Maar Daniël het steeds gebid. Toe sit hulle hom by die leeus. BRUL!", "God het ’n engel gestuur om die leeus se bekke toe te maak. Klap!", "Daniël was veilig. God was die hele nag by hom!"],
        verse: simple("My God het die leeus se bekke toegemaak.", "Daniël 6:23"),
        action: "Brul soos ’n groot leeu. Klap dan jou hande toe soos die leeus se bekke, en vou jou hande om te bid soos Daniël.",
        lessons: ["God is altyd by my, oral."],
        questions: ["Waar kan ons met God praat? (Oral!)"],
        prayer: ["Liewe God,", "dankie dat U by my is. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Faithful in the Lions’ Den", bibleStory: "Daniel 6", readPassage: "Daniel 6:3–23",
        story: [
          "Daniel had been taken from Jerusalem to Babylon as a teenager. Decades later, now an old man, he was one of the top leaders in the Persian empire under King Darius. Daniel was so honest and hard-working that the king planned to put him in charge of the whole kingdom.",
          "The other officials were jealous. They searched for something wrong in Daniel’s work but couldn’t find a single mistake. So they said, ‘We will never find any basis for charges against Daniel unless it has something to do with the law of his God.’ They knew Daniel prayed to God three times a day.",
          "They tricked King Darius into signing a law: for thirty days, anyone who prayed to any god or man except the king would be thrown into the lions’ den. Once signed, the law could not be changed.",
          "When Daniel heard about the law, he went home, opened the windows of his upstairs room toward Jerusalem, knelt down and prayed, giving thanks to God, ‘just as he had done before’. Daniel’s prayer life wasn’t something he did only in emergencies. It was a daily friendship with God that he wasn’t willing to give up.",
          "The officials caught him and reported him. The king was upset, because he liked Daniel, but he couldn’t change the law. Daniel was thrown into the den, and a stone was rolled over the entrance. The king said, ‘May your God, whom you serve continually, rescue you!’",
          "At dawn the king rushed to the den. ‘Daniel, has your God been able to rescue you?’ Daniel answered, ‘My God sent His angel, and he shut the mouths of the lions.’ Not a scratch was found on him, ‘because he had trusted in his God.’ Then King Darius commanded his whole empire to honour the living God.",
        ],
        verse: simple("My God sent His angel, and he shut the mouths of the lions.", "Daniel 6:22"),
        lessons: ["God is always with His children, even in the most dangerous places.", "A daily friendship with God gives us courage when tests come.", "God honours those who stay faithful to Him, and uses their faith to point others to Him."],
        questions: ["Why couldn’t the officials find anything wrong with Daniel?", "What do you think Daniel prayed about three times a day for all those years?", "What would help you build a daily habit of talking with God?"],
        listen: "Daniel thanked God even when he was in danger. Spend one minute thanking God for things. Then ask: ‘Lord, how can I spend time with you every day?’ Listen for His idea.",
        prayer: ["Lord, thank you that you are always with me.", "Help me to be faithful to you like Daniel, even when…", "I want to talk with you every day."],
        mission: { compass: "talk", text: "Choose three times tomorrow (like Daniel) to talk to God: when you wake up, at lunch and at bedtime." },
        journal: "Draw a window like Daniel’s. Around it, write the three times each day you will talk with God, and what you might thank Him for.",
      }),
      af: older({
        title: "Getrou in die Leeukuil", bibleStory: "Daniël 6", readPassage: "Daniël 6:4–24",
        story: [
          "Daniël is as ’n tiener uit Jerusalem na Babel weggevoer. Baie jare later, nou ’n ou man, was hy een van die hoofleiers in die Persiese ryk onder koning Darius. Daniël was so eerlik en hardwerkend dat die koning beplan het om hom oor die hele koninkryk aan te stel.",
          "Die ander amptenare was jaloers. Hulle het na iets verkeerds in Daniël se werk gesoek, maar kon nie een enkele fout kry nie. Toe sê hulle: ‘Ons sal nooit iets kry om Daniël van te beskuldig nie, tensy dit met die wet van sy God te doen het.’ Hulle het geweet Daniël bid drie keer per dag tot God.",
          "Hulle het koning Darius gekul om ’n wet te teken: vir dertig dae sou enigiemand wat tot enige god of mens behalwe die koning bid, in die leeukuil gegooi word. Sodra dit geteken was, kon die wet nie verander word nie.",
          "Toe Daniël van die wet hoor, het hy huis toe gegaan, die vensters van sy bokamer na Jerusalem oopgemaak, gekniel en gebid, en God gedank, ‘net soos hy altyd gedoen het’. Daniël se gebedslewe was nie iets wat hy net in noodgevalle gedoen het nie. Dit was ’n daaglikse vriendskap met God wat hy nie wou opgee nie.",
          "Die amptenare het hom betrap en hom aangekla. Die koning was ontsteld, want hy was lief vir Daniël, maar hy kon nie die wet verander nie. Daniël is in die kuil gegooi, en ’n klip is oor die ingang gerol. Die koning het gesê: ‘Mag jou God, wat jy altyd dien, jou red!’",
          "Met sonop het die koning na die kuil gehardloop. ‘Daniël, kon jou God jou red?’ Daniël het geantwoord: ‘My God het sy engel gestuur, en hy het die bekke van die leeus toegemaak.’ Daar was nie een krapmerk op hom nie, ‘omdat hy op sy God vertrou het’. Toe het koning Darius sy hele ryk beveel om die lewende God te eer.",
        ],
        verse: simple("My God het sy engel gestuur, en hy het die bekke van die leeus toegemaak.", "Daniël 6:23"),
        lessons: ["God is altyd by sy kinders, selfs op die gevaarlikste plekke.", "’n Daaglikse vriendskap met God gee ons moed wanneer toetse kom.", "God eer die wat aan Hom getrou bly, en gebruik hulle geloof om ander na Hom te wys."],
        questions: ["Hoekom kon die amptenare niks verkeerd met Daniël kry nie?", "Waaroor dink jy het Daniël al daardie jare drie keer per dag gebid?", "Wat sal jou help om ’n daaglikse gewoonte te bou om met God te praat?"],
        listen: "Daniël het God gedank selfs toe hy in gevaar was. Spandeer een minuut om God vir dinge te dank. Vra dan: ‘Here, hoe kan ek elke dag tyd saam met U spandeer?’ Luister vir sy plan.",
        prayer: ["Here, dankie dat U altyd by my is.", "Help my om getrou aan U te wees soos Daniël, selfs as…", "Ek wil elke dag met U praat."],
        mission: { compass: "talk", text: "Kies môre drie tye (soos Daniël) om met God te praat: as jy wakker word, middagete en slaaptyd." },
        journal: "Teken ’n venster soos Daniël s’n. Skryf rondom dit die drie tye elke dag wanneer jy met God sal praat, en waarvoor jy Hom kan dank.",
      }),
    },
  },

  /* ---------------- Night 21: Campfire ---------------- */
  "j01-n21": {
    "2-3": {
      en: toddler({
        title: "Campfire Night",
        story: ["Well done, little explorer! Let’s sit by the campfire and remember: God talked to Samuel. God sees my heart. God made David brave. God is my shepherd. God sent fire from heaven. God was with Daniel."],
        game: "Brave explorer: climb onto the bed (your mountain!), stand tall and shout: ‘God makes me brave!’ Then jump into Mom’s arms.",
        lessons: [], questions: ["Who was the bravest in our stories?"],
        prayer: ["Thank you, God,", "you make me brave. Amen."],
      }),
      af: toddler({
        title: "Kampvuuraand",
        story: ["Mooi so, klein ontdekker! Kom ons sit by die kampvuur en onthou: God het met Samuel gepraat. God sien my hart. God het Dawid dapper gemaak. God is my herder. God het vuur uit die hemel gestuur. God was by Daniël."],
        game: "Dapper ontdekker: klim op die bed (jou berg!), staan regop en skree: ‘God maak my dapper!’ Spring dan in Mamma se arms.",
        lessons: [], questions: ["Wie was die dapperste in ons stories?"],
        prayer: ["Dankie, God,", "U maak my dapper. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Campfire Night: Brave Hearts Mountain",
        story: ["You’ve climbed Brave Hearts Mountain! This week a boy learned to hear God’s voice, a shepherd was chosen for his heart, a giant fell, a psalm reminded us that the Good Shepherd walks with us, fire fell from heaven, and lions couldn’t touch a man who prayed. In every story, courage came from the same place: knowing God, talking with Him and trusting Him."],
        game: "Courage cards: each of you writes a ‘giant’ (a fear or problem) on a piece of paper. Swap papers, then find a Bible verse from this week that answers the other person’s giant.",
        lessons: [],
        questions: ["Which brave person from this week would you most like to be like? Why?", "What did all of them have in common?", "What have you learned this week about hearing God’s voice?"],
        prayer: ["Lord, you speak to me, you see my heart and you make me brave.", "This week I want to be brave about…", "Thank you that you are always with me."],
        mission: { compass: "listen", text: "Learn Joshua 1:9 by heart and say it to someone in your family." },
        journal: "Look back at your ‘Listening page’. Write down anything you sensed God saying this week, and one way you saw Him make you brave.",
      }),
      af: older({
        title: "Kampvuuraand: Dapperhart-berg",
        story: ["Jy het Dapperhart-berg geklim! Hierdie week het ’n seun geleer om God se stem te hoor, ’n skaapwagter is gekies vanweë sy hart, ’n reus het geval, ’n psalm het ons herinner dat die goeie Herder saam met ons loop, vuur het uit die hemel geval, en leeus kon nie ’n man aanraak wat gebid het nie. In elke storie het moed van dieselfde plek gekom: om God te ken, met Hom te praat en Hom te vertrou."],
        game: "Moedkaartjies: elkeen skryf ’n ‘reus’ (’n vrees of probleem) op ’n stukkie papier. Ruil die papiere om, en soek dan ’n Bybelvers uit hierdie week wat die ander persoon se reus antwoord.",
        lessons: [],
        questions: ["Op watter dapper mens van hierdie week wil jy die meeste lyk? Hoekom?", "Wat het hulle almal in gemeen gehad?", "Wat het jy hierdie week geleer oor om God se stem te hoor?"],
        prayer: ["Here, U praat met my, U sien my hart en U maak my dapper.", "Hierdie week wil ek dapper wees oor…", "Dankie dat U altyd by my is."],
        mission: { compass: "listen", text: "Leer Josua 1:9 uit jou kop en sê dit vir iemand in jou familie." },
        journal: "Kyk terug na jou ‘Luisterblad’. Skryf neer wat jy aangevoel het God hierdie week sê, en een manier waarop jy gesien het Hy maak jou dapper.",
      }),
    },
  },
};
