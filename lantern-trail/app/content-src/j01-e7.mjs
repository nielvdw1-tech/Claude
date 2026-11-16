/**
 * Journey Trail 1, final expedition (The Greatest Adventure): ages 2–3 and 8–9, English and Afrikaans.
 * Covers the Rhema statement of faith: substitution, resurrection, ascension and intercession,
 * the new birth, and the return of Christ (told as joyful hope).
 * Status: DRAFT, awaiting review (see docs/CONTENT-GUIDE.md section 7).
 */
const simple = (text, refText) => ({ text, refText, wording: "simple" });
const toddler = (o) => ({ prayerStyle: "repeat", ...o });
const older = (o) => ({ prayerStyle: "own", ...o });

export default {
  /* ---------------- Night 43: The cross ---------------- */
  "j01-n43": {
    "2-3": {
      en: toddler({
        title: "Jesus Loves Me So Much", bibleStory: "Luke 23",
        story: ["Jesus did so many good things. He helped people and loved everyone.", "But some people did not like Jesus. They put Him on a wooden cross.", "Jesus let them, because He loves us so much.", "On the cross, Jesus took away all the wrong things we do.", "Jesus died. Everyone was sad. But wait… the story is not finished!"],
        verse: simple("Jesus loves us so much.", "Romans 5:8"),
        action: "Make a cross with your two pointing fingers. Then open your arms wide: ‘Jesus loves me THIS much!’",
        lessons: ["Jesus loves me so much that He died for me."],
        questions: ["How much does Jesus love you? Show me with your arms!"],
        prayer: ["Thank you, Jesus,", "for loving me so much. Amen."],
      }),
      af: toddler({
        title: "Jesus Is So Lief vir My", bibleStory: "Lukas 23",
        story: ["Jesus het so baie goeie dinge gedoen. Hy het mense gehelp en almal liefgehad.", "Maar party mense het nie van Jesus gehou nie. Hulle het Hom aan ’n houtkruis gesit.", "Jesus het hulle toegelaat, want Hy is so lief vir ons.", "Aan die kruis het Jesus al die verkeerde dinge wat ons doen, weggevat.", "Jesus het gesterf. Almal was hartseer. Maar wag… die storie is nog nie klaar nie!"],
        verse: simple("Jesus is so lief vir ons.", "Romeine 5:8"),
        action: "Maak ’n kruis met jou twee wysvingers. Maak dan jou arms wyd oop: ‘Jesus is SO lief vir my!’",
        lessons: ["Jesus is so lief vir my dat Hy vir my gesterf het."],
        questions: ["Hoe lief is Jesus vir jou? Wys my met jou arms!"],
        prayer: ["Dankie, Jesus,", "dat U so lief is vir my. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "In My Place", bibleStory: "Luke 22 – 23", readPassage: "Luke 23:33–47",
        story: [
          "Jesus had healed the sick, welcomed sinners and taught about God’s kingdom. Crowds loved Him. But the religious leaders were jealous and afraid of losing their power, and they plotted to kill Him. One of Jesus’ own disciples, Judas, betrayed Him for thirty pieces of silver.",
          "Jesus was arrested at night, put on trial and falsely accused. The Roman governor, Pilate, said three times, ‘I find no basis for a charge against this man.’ Yet he handed Jesus over to be crucified, the cruellest death the Romans used.",
          "Jesus could have stopped it. He had calmed storms and commanded demons. He said He could call twelve legions of angels. But He chose to stay, because of love, and because this was the reason He had come.",
          "On the cross, Jesus prayed for the soldiers: ‘Father, forgive them, for they do not know what they are doing.’ To a criminal hanging next to Him who asked Him for mercy, He promised, ‘Today you will be with me in paradise.’",
          "Why did Jesus die? Remember the garden: sin brings death and separates us from God, and every person has sinned. Jesus had never sinned once. On the cross, He took our place, as a substitute. Isaiah had written, ‘He was pierced for our transgressions… the punishment that brought us peace was on Him.’ He took the punishment we deserved, so that everyone who believes in Him can be forgiven and made right with God through His blood.",
          "At about three in the afternoon, Jesus called out, ‘Father, into your hands I commit my spirit,’ and He died. At that very moment, the huge curtain in the temple, which separated people from the Most Holy Place where God’s presence was, tore in two from top to bottom. The way into God’s presence was open.",
          "Jesus’ friends laid His body in a tomb carved out of rock and rolled a heavy stone across the entrance. It seemed like the end. But it wasn’t.",
        ],
        verse: simple("But God demonstrates His own love for us in this: while we were still sinners, Christ died for us.", "Romans 5:8"),
        lessons: ["Jesus chose to die on the cross because He loves us.", "Jesus took our place: He carried the punishment for our sin so we could be forgiven.", "Because of the cross, the way into God’s presence is open to us."],
        questions: ["What did Jesus pray for the people who crucified Him?", "What does it mean that Jesus died ‘in our place’?", "Why do you think the temple curtain tore from top to bottom, and not from bottom to top?"],
        listen: "Look at a cross, or draw one. Be quiet for one minute. Ask Jesus: ‘What do you want me to understand about your love tonight?’ Listen. If you want to, thank Him for taking your place.",
        prayer: ["Jesus, thank you for dying on the cross in my place.", "Thank you for taking away my sin, including…", "Thank you that I can come close to God because of you."],
        mission: { compass: "talk", text: "Make a small cross out of two sticks or two pencils and put it by your bed, to remind you of Jesus’ love." },
        journal: "Write Romans 5:8 in the middle of a page. Around it, write what you want to say to Jesus about what He did for you.",
      }),
      af: older({
        title: "In My Plek", bibleStory: "Lukas 22 – 23", readPassage: "Lukas 23:33–47",
        story: [
          "Jesus het siekes gesond gemaak, sondaars verwelkom en oor God se koninkryk geleer. Skares was lief vir Hom. Maar die godsdienstige leiers was jaloers en bang om hulle mag te verloor, en hulle het beplan om Hom dood te maak. Een van Jesus se eie dissipels, Judas, het Hom vir dertig silwerstukke verraai.",
          "Jesus is in die nag gevang, verhoor en valslik beskuldig. Die Romeinse goewerneur, Pilatus, het drie keer gesê: ‘Ek vind geen skuld in hierdie man nie.’ Tog het hy Jesus oorgegee om gekruisig te word, die wreedste dood wat die Romeine gebruik het.",
          "Jesus kon dit gekeer het. Hy het storms laat bedaar en bose geeste beveel. Hy het gesê Hy kon twaalf leërs engele roep. Maar Hy het gekies om te bly, uit liefde, en omdat dit die rede was waarom Hy gekom het.",
          "Aan die kruis het Jesus vir die soldate gebid: ‘Vader, vergewe hulle, want hulle weet nie wat hulle doen nie.’ Aan ’n misdadiger wat langs Hom gehang het en Hom om genade gevra het, het Hy belowe: ‘Vandag sal jy saam met My in die paradys wees.’",
          "Hoekom het Jesus gesterf? Onthou die tuin: sonde bring die dood en skei ons van God, en elke mens het gesondig. Jesus het nooit een keer gesondig nie. Aan die kruis het Jesus ons plek ingeneem, as ons plaasvervanger. Jesaja het geskryf: ‘Hy is deurboor oor ons oortredinge… die straf wat vir ons vrede gebring het, was op Hom.’ Hy het die straf gedra wat ons verdien het, sodat elkeen wat in Hom glo, vergewe en deur sy bloed reg met God gemaak kan word.",
          "Omtrent drie-uur die middag het Jesus uitgeroep: ‘Vader, in u hande gee Ek my gees oor,’ en Hy het gesterf. Op daardie einste oomblik het die groot gordyn in die tempel, wat mense geskei het van die Allerheiligste waar God se teenwoordigheid was, van bo tot onder in twee geskeur. Die pad na God se teenwoordigheid was oop.",
          "Jesus se vriende het sy liggaam in ’n graf gelê wat in die rots uitgekap is, en ’n swaar klip voor die ingang gerol. Dit het gelyk soos die einde. Maar dit was nie.",
        ],
        verse: simple("Maar God bewys sy liefde vir ons hierin: toe ons nog sondaars was, het Christus vir ons gesterf.", "Romeine 5:8"),
        lessons: ["Jesus het gekies om aan die kruis te sterf omdat Hy ons liefhet.", "Jesus het ons plek ingeneem: Hy het die straf vir ons sonde gedra sodat ons vergewe kan word.", "Danksy die kruis is die pad na God se teenwoordigheid vir ons oop."],
        questions: ["Wat het Jesus gebid vir die mense wat Hom gekruisig het?", "Wat beteken dit dat Jesus ‘in ons plek’ gesterf het?", "Hoekom dink jy het die tempelgordyn van bo tot onder geskeur, en nie van onder na bo nie?"],
        listen: "Kyk na ’n kruis, of teken een. Wees een minuut lank stil. Vra Jesus: ‘Wat wil U hê moet ek vanaand oor u liefde verstaan?’ Luister. As jy wil, dank Hom dat Hy jou plek ingeneem het.",
        prayer: ["Jesus, dankie dat U in my plek aan die kruis gesterf het.", "Dankie dat U my sonde weggeneem het, ook…", "Dankie dat ek danksy U naby aan God kan kom."],
        mission: { compass: "talk", text: "Maak ’n klein kruisie van twee stokkies of twee potlode en sit dit langs jou bed, om jou aan Jesus se liefde te herinner." },
        journal: "Skryf Romeine 5:8 in die middel van ’n bladsy. Skryf rondom dit wat jy vir Jesus wil sê oor wat Hy vir jou gedoen het.",
      }),
    },
  },

  /* ---------------- Night 44: The empty tomb ---------------- */
  "j01-n44": {
    "2-3": {
      en: toddler({
        title: "Jesus Is Alive!", bibleStory: "Matthew 28",
        story: ["Early on Sunday morning, some ladies went to Jesus’ tomb. They were sad.", "RUMBLE! The ground shook! The big stone was rolled away!", "An angel said, ‘Jesus is not here. He is ALIVE!’", "Then they saw Jesus! They were so happy!", "Jesus is alive! He is stronger than anything!"],
        verse: simple("He is not here. He is alive!", "Matthew 28:6"),
        action: "Crouch down small and sad. Then jump up high with your arms in the air and shout: ‘Jesus is ALIVE!’",
        lessons: ["Jesus is alive!"],
        questions: ["Can you shout it with me? ‘Jesus is alive!’"],
        prayer: ["Hooray, Jesus!", "You are alive! Amen."],
      }),
      af: toddler({
        title: "Jesus Leef!", bibleStory: "Matteus 28",
        story: ["Vroeg Sondagoggend het ’n paar vroue na Jesus se graf gegaan. Hulle was hartseer.", "RUMMEL! Die grond het geskud! Die groot klip was weggerol!", "’n Engel het gesê: ‘Jesus is nie hier nie. Hy LEEF!’", "Toe sien hulle Jesus! Hulle was so bly!", "Jesus leef! Hy is sterker as enigiets!"],
        verse: simple("Hy is nie hier nie. Hy leef!", "Matteus 28:6"),
        action: "Hurk klein en hartseer. Spring dan hoog op met jou arms in die lug en skree: ‘Jesus LEEF!’",
        lessons: ["Jesus leef!"],
        questions: ["Kan jy dit saam met my skree? ‘Jesus leef!’"],
        prayer: ["Hoera, Jesus!", "U leef! Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "He Has Risen!", bibleStory: "Matthew 28", readPassage: "Matthew 28:1–10",
        story: [
          "Early on Sunday morning, the third day after Jesus died, Mary Magdalene and another Mary went to look at the tomb. Their hearts were broken. They had watched Jesus die, and now they came to grieve.",
          "Suddenly there was a violent earthquake. An angel of the Lord came down from heaven, rolled back the stone and sat on it. His appearance was like lightning, and his clothes were as white as snow. The Roman guards were so terrified that they shook and became like dead men.",
          "The angel said to the women, ‘Do not be afraid, for I know that you are looking for Jesus, who was crucified. He is not here; He has risen, just as He said. Come and see the place where He lay.’ The stone wasn’t rolled away to let Jesus out. It was rolled away to let the women see in: the tomb was empty!",
          "The women hurried away, afraid yet filled with joy, to tell the disciples. And on the way, suddenly Jesus met them. ‘Greetings,’ He said. They fell at His feet and worshipped Him.",
          "Jesus rose bodily from the dead. It wasn’t just His spirit or a nice idea. He ate fish with His disciples, showed Thomas the scars in His hands, and over forty days was seen by hundreds of people at once.",
          "Why does the resurrection matter so much? Because it proves that Jesus is who He said He is, the Son of God. It shows that God accepted His sacrifice for our sins. And it means that death is not the end. Jesus defeated death, and everyone who belongs to Him will one day be raised to live with Him forever.",
          "The worst day in history was followed by the best morning. Because Jesus is alive, we never have to be without hope.",
        ],
        verse: simple("He is not here; He has risen, just as He said.", "Matthew 28:6"),
        lessons: ["Jesus rose bodily from the dead. He is alive today!", "The resurrection proves that Jesus is the Son of God and that His sacrifice for our sin was accepted.", "Because Jesus defeated death, everyone who belongs to Him will live with Him forever."],
        questions: ["Why was the stone rolled away?", "How did the women feel when they heard the news? Why ‘afraid yet filled with joy’?", "What difference does it make to your life that Jesus is alive right now?"],
        listen: "Jesus is alive, so you can talk to Him right now, as you would to a living friend. Tell Him something about your day. Then be still and ask: ‘Jesus, what do you want to say to me?’",
        prayer: ["Jesus, you are alive!", "Thank you that you defeated sin and death for me.", "Because you live, I am not afraid of…"],
        mission: { compass: "love", text: "Tell someone tomorrow, ‘Jesus is alive!’ and explain why it matters to you." },
        journal: "Draw the empty tomb with the stone rolled away. Write in big letters: ‘HE HAS RISEN!’ Underneath, write three reasons this is good news.",
      }),
      af: older({
        title: "Hy het Opgestaan!", bibleStory: "Matteus 28", readPassage: "Matteus 28:1–10",
        story: [
          "Vroeg Sondagoggend, die derde dag nadat Jesus gesterf het, het Maria Magdalena en ’n ander Maria gegaan om na die graf te kyk. Hulle harte was gebreek. Hulle het gesien hoe Jesus sterf, en nou het hulle gekom om te treur.",
          "Skielik was daar ’n hewige aardbewing. ’n Engel van die Here het uit die hemel neergedaal, die klip weggerol en daarop gaan sit. Hy het gelyk soos weerlig, en sy klere was so wit soos sneeu. Die Romeinse wagte was so doodbang dat hulle gebewe het en soos dooie mense geword het.",
          "Die engel het vir die vroue gesê: ‘Moenie bang wees nie, want ek weet julle soek Jesus wat gekruisig is. Hy is nie hier nie; Hy het opgestaan, net soos Hy gesê het. Kom kyk na die plek waar Hy gelê het.’ Die klip is nie weggerol om Jesus uit te laat nie. Dit is weggerol om die vroue in te laat kyk: die graf was leeg!",
          "Die vroue het gou weggegaan, bang maar vol vreugde, om die dissipels te vertel. En op pad het Jesus hulle skielik ontmoet. ‘Goeiemôre,’ het Hy gesê. Hulle het by sy voete neergeval en Hom aanbid.",
          "Jesus het liggaamlik uit die dood opgestaan. Dit was nie net sy gees of ’n mooi gedagte nie. Hy het saam met sy dissipels vis geëet, vir Tomas die littekens in sy hande gewys, en oor veertig dae is Hy deur honderde mense tegelyk gesien.",
          "Hoekom is die opstanding so belangrik? Omdat dit bewys dat Jesus is wie Hy gesê het Hy is, die Seun van God. Dit wys dat God sy offer vir ons sondes aanvaar het. En dit beteken dat die dood nie die einde is nie. Jesus het die dood oorwin, en almal wat aan Hom behoort, sal eendag opgewek word om vir altyd saam met Hom te lewe.",
          "Die ergste dag in die geskiedenis is gevolg deur die beste oggend. Omdat Jesus leef, hoef ons nooit sonder hoop te wees nie.",
        ],
        verse: simple("Hy is nie hier nie; Hy het opgestaan, net soos Hy gesê het.", "Matteus 28:6"),
        lessons: ["Jesus het liggaamlik uit die dood opgestaan. Hy leef vandag!", "Die opstanding bewys dat Jesus die Seun van God is en dat sy offer vir ons sonde aanvaar is.", "Omdat Jesus die dood oorwin het, sal almal wat aan Hom behoort, vir altyd saam met Hom lewe."],
        questions: ["Hoekom is die klip weggerol?", "Hoe het die vroue gevoel toe hulle die nuus hoor? Hoekom ‘bang maar vol vreugde’?", "Watter verskil maak dit in jou lewe dat Jesus nou lewe?"],
        listen: "Jesus leef, so jy kan nou met Hom praat, soos met ’n lewende vriend. Vertel Hom iets van jou dag. Wees dan stil en vra: ‘Jesus, wat wil U vir my sê?’",
        prayer: ["Jesus, U leef!", "Dankie dat U sonde en die dood vir my oorwin het.", "Omdat U leef, is ek nie bang vir… nie."],
        mission: { compass: "love", text: "Sê môre vir iemand: ‘Jesus leef!’ en verduidelik hoekom dit vir jou saak maak." },
        journal: "Teken die leë graf met die klip weggerol. Skryf in groot letters: ‘HY HET OPGESTAAN!’ Skryf daaronder drie redes hoekom dit goeie nuus is.",
      }),
    },
  },

  /* ---------------- Night 45: Breakfast on the beach ---------------- */
  "j01-n45": {
    "2-3": {
      en: toddler({
        title: "Breakfast with Jesus", bibleStory: "John 21",
        story: ["Peter had said, ‘I don’t know Jesus.’ He felt very sad and sorry.", "One morning, Jesus cooked breakfast on the beach. Yummy fish!", "Jesus asked, ‘Peter, do you love me?’", "Peter said, ‘Yes, Lord! I love you!’", "Jesus forgave Peter. Jesus forgives me too!"],
        verse: simple("Jesus forgives us.", "1 John 1:9"),
        action: "Pretend to cook fish on a fire: sizzle, sizzle! Then give Mom a hug and say, ‘I love you, Jesus!’",
        lessons: ["When I say sorry, Jesus forgives me."],
        questions: ["Do you love Jesus? Tell Him!"],
        prayer: ["Dear Jesus,", "I love you. Thank you for forgiving me. Amen."],
      }),
      af: toddler({
        title: "Ontbyt saam met Jesus", bibleStory: "Johannes 21",
        story: ["Petrus het gesê: ‘Ek ken nie vir Jesus nie.’ Hy het baie hartseer en jammer gevoel.", "Een oggend het Jesus ontbyt op die strand gekook. Lekker vis!", "Jesus het gevra: ‘Petrus, het jy My lief?’", "Petrus het gesê: ‘Ja, Here! Ek het U lief!’", "Jesus het Petrus vergewe. Jesus vergewe my ook!"],
        verse: simple("Jesus vergewe ons.", "1 Johannes 1:9"),
        action: "Maak of jy vis op ’n vuur kook: sis, sis! Druk dan vir Mamma en sê: ‘Ek het U lief, Jesus!’",
        lessons: ["As ek jammer sê, vergewe Jesus my."],
        questions: ["Het jy Jesus lief? Vertel Hom!"],
        prayer: ["Liewe Jesus,", "ek het U lief. Dankie dat U my vergewe. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Do You Love Me?", bibleStory: "John 18 & 21", readPassage: "John 21:1–17",
        story: [
          "On the night Jesus was arrested, Peter had followed at a distance. In a courtyard, warming himself by a charcoal fire, three people asked him whether he was one of Jesus’ disciples. Three times Peter said, ‘I don’t know Him!’ Then the rooster crowed, just as Jesus had predicted. Peter went outside and wept bitterly.",
          "Even after Jesus rose from the dead, Peter must have wondered: could Jesus ever trust him again?",
          "One night, back in Galilee, Peter said, ‘I’m going fishing,’ and some of the other disciples went with him. They caught nothing all night. Early in the morning, a man on the shore called out, ‘Throw your net on the right side of the boat.’ They did, and the net was so full of fish they couldn’t haul it in. John said, ‘It is the Lord!’ Peter jumped straight into the water and swam to shore.",
          "On the beach, Jesus had made a charcoal fire, the same kind of fire Peter had stood beside when he denied Him. He had cooked fish and bread. ‘Come and have breakfast,’ He said.",
          "After breakfast, Jesus asked Peter three times, ‘Simon son of John, do you love me?’ Three times Peter answered, ‘Yes, Lord, you know that I love you.’ One question for each denial. Jesus wasn’t trying to shame Peter; He was healing him. And each time, Jesus gave Peter a job: ‘Feed my sheep.’",
          "Jesus didn’t just forgive Peter; He restored him. He gave him his calling back. Peter went on to preach to thousands and became a leader of the early church.",
          "When we fail, Jesus doesn’t give up on us. The Bible promises, ‘If we confess our sins, He is faithful and just and will forgive us our sins and purify us from all unrighteousness.’ Then He says to us, too, ‘Follow me.’",
        ],
        verse: simple("If we confess our sins, He is faithful and just and will forgive us our sins and purify us from all unrighteousness.", "1 John 1:9"),
        lessons: ["Jesus forgives us completely when we confess our sins.", "Jesus doesn’t only forgive us; He restores us and gives us a purpose again.", "Our failures are never the end of the story with Jesus."],
        questions: ["Why do you think Jesus asked Peter the same question three times?", "What job did Jesus give Peter? What does that show about forgiveness?", "Is there something you feel bad about that you need to bring to Jesus?"],
        listen: "Hear Jesus ask you, ‘Do you love me?’ Answer Him honestly. Then ask: ‘Jesus, is there anything I need to bring to you?’ If something comes to mind, tell Him, and receive His forgiveness.",
        prayer: ["Jesus, you know that I love you.", "I’m sorry for…", "Thank you that you forgive me and never give up on me."],
        mission: { compass: "love", text: "If someone has let you down, show them tomorrow that you haven’t given up on them, the way Jesus didn’t give up on Peter." },
        journal: "Write Jesus’ question, ‘Do you love me?’ Write your answer, and three ways you can show Jesus you love Him this week.",
      }),
      af: older({
        title: "Het Jy My Lief?", bibleStory: "Johannes 18 & 21", readPassage: "Johannes 21:1–17",
        story: [
          "Die nag toe Jesus gevang is, het Petrus op ’n afstand gevolg. In ’n binnehof, waar hy hom by ’n houtskoolvuur warm gemaak het, het drie mense hom gevra of hy een van Jesus se dissipels is. Drie keer het Petrus gesê: ‘Ek ken Hom nie!’ Toe het die haan gekraai, net soos Jesus voorspel het. Petrus het uitgegaan en bitterlik gehuil.",
          "Selfs nadat Jesus uit die dood opgestaan het, moes Petrus gewonder het: sal Jesus my ooit weer kan vertrou?",
          "Een nag, terug in Galilea, het Petrus gesê: ‘Ek gaan visvang,’ en party van die ander dissipels het saamgegaan. Hulle het die hele nag niks gevang nie. Vroeg in die oggend het ’n man op die strand geroep: ‘Gooi julle net aan die regterkant van die boot uit.’ Hulle het, en die net was so vol vis dat hulle dit nie kon intrek nie. Johannes het gesê: ‘Dit is die Here!’ Petrus het reguit in die water gespring en strand toe geswem.",
          "Op die strand het Jesus ’n houtskoolvuur gemaak, dieselfde soort vuur waarby Petrus gestaan het toe hy Hom verloën het. Hy het vis en brood gaargemaak. ‘Kom eet ontbyt,’ het Hy gesê.",
          "Ná ontbyt het Jesus Petrus drie keer gevra: ‘Simon, seun van Johannes, het jy My lief?’ Drie keer het Petrus geantwoord: ‘Ja, Here, U weet dat ek U liefhet.’ Een vraag vir elke keer wat hy Jesus verloën het. Jesus het nie probeer om Petrus skaam te laat voel nie; Hy het hom genees. En elke keer het Jesus vir Petrus ’n werk gegee: ‘Sorg vir my skape.’",
          "Jesus het Petrus nie net vergewe nie; Hy het hom herstel. Hy het sy roeping aan hom teruggegee. Petrus het later vir duisende mense gepreek en ’n leier van die eerste kerk geword.",
          "As ons misluk, gee Jesus ons nie op nie. Die Bybel belowe: ‘As ons ons sondes bely, is Hy getrou en regverdig, en Hy sal ons ons sondes vergewe en ons reinig van alle onreg.’ Dan sê Hy ook vir ons: ‘Volg My.’",
        ],
        verse: simple("As ons ons sondes bely, is Hy getrou en regverdig, en Hy sal ons ons sondes vergewe en ons reinig van alle onreg.", "1 Johannes 1:9"),
        lessons: ["Jesus vergewe ons heeltemal as ons ons sondes bely.", "Jesus vergewe ons nie net nie; Hy herstel ons en gee ons weer ’n doel.", "Ons mislukkings is nooit die einde van die storie saam met Jesus nie."],
        questions: ["Hoekom dink jy het Jesus Petrus drie keer dieselfde vraag gevra?", "Watter werk het Jesus vir Petrus gegee? Wat wys dit oor vergifnis?", "Is daar iets waaroor jy sleg voel wat jy na Jesus toe moet bring?"],
        listen: "Hoor hoe Jesus jou vra: ‘Het jy My lief?’ Antwoord Hom eerlik. Vra dan: ‘Jesus, is daar iets wat ek na U toe moet bring?’ As iets opkom, vertel Hom, en ontvang sy vergifnis.",
        prayer: ["Jesus, U weet dat ek U liefhet.", "Ek is jammer vir…", "Dankie dat U my vergewe en my nooit opgee nie."],
        mission: { compass: "love", text: "As iemand jou teleurgestel het, wys vir hulle môre dat jy hulle nie opgegee het nie, soos Jesus vir Petrus nie opgegee het nie." },
        journal: "Skryf Jesus se vraag: ‘Het jy My lief?’ Skryf jou antwoord, en drie maniere hoe jy hierdie week vir Jesus kan wys dat jy Hom liefhet.",
      }),
    },
  },

  /* ---------------- Night 46: Ascension and the Holy Spirit ---------------- */
  "j01-n46": {
    "2-3": {
      en: toddler({
        title: "The Helper Comes", bibleStory: "Acts 1 – 2",
        story: ["Jesus went back up to heaven. Up, up, up into the clouds!", "But He said, ‘I will send you a Helper.’", "Jesus’ friends waited and prayed.", "Then WHOOSH! A big wind came, and little flames sat on their heads!", "The Holy Spirit came to live in them. God lives in us and helps us!"],
        verse: simple("God gives us a Helper, the Holy Spirit.", "John 14:16"),
        action: "Blow like a big wind: WHOOSH! Then put your hand on your heart: ‘God lives in me!’",
        lessons: ["The Holy Spirit lives in me and helps me."],
        questions: ["Can you blow like the wind?"],
        prayer: ["Dear God,", "thank you for your Holy Spirit. Amen."],
      }),
      af: toddler({
        title: "Die Helper Kom", bibleStory: "Handelinge 1 – 2",
        story: ["Jesus het teruggegaan hemel toe. Op, op, op in die wolke in!", "Maar Hy het gesê: ‘Ek sal vir julle ’n Helper stuur.’", "Jesus se vriende het gewag en gebid.", "Toe WOESJ! ’n Groot wind het gekom, en klein vlammetjies het op hulle koppe gesit!", "Die Heilige Gees het in hulle kom woon. God woon in ons en help ons!"],
        verse: simple("God gee vir ons ’n Helper, die Heilige Gees.", "Johannes 14:16"),
        action: "Blaas soos ’n groot wind: WOESJ! Sit dan jou hand op jou hart: ‘God woon in my!’",
        lessons: ["Die Heilige Gees woon in my en help my."],
        questions: ["Kan jy blaas soos die wind?"],
        prayer: ["Liewe God,", "dankie vir u Heilige Gees. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Power from on High", bibleStory: "Acts 1 – 2", readPassage: "Acts 1:8–11 and 2:1–4",
        story: [
          "For forty days after His resurrection, Jesus appeared to His followers and taught them about God’s kingdom. Then He led them up the Mount of Olives. ‘You will receive power when the Holy Spirit comes on you,’ He promised, ‘and you will be my witnesses… to the ends of the earth.’ Then, while they watched, He was taken up into heaven, and a cloud hid Him from their sight.",
          "As they stood staring at the sky, two angels appeared: ‘Why do you stand here looking into the sky? This same Jesus, who has been taken from you into heaven, will come back in the same way you have seen Him go.’",
          "Where is Jesus now? The Bible says He is seated at the right hand of the Father, and that He ‘always lives to intercede’ for us. He is our High Priest, who understands our weakness, and our Advocate, who speaks for us before the Father. Right now, Jesus is praying for you!",
          "The disciples went back to Jerusalem and prayed together, waiting as Jesus had told them. Ten days later, on the festival of Pentecost, they were all together when suddenly a sound like a violent wind came from heaven and filled the whole house. They saw what looked like tongues of fire resting on each of them. ‘All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them.’",
          "People from many nations were in Jerusalem, and each heard the disciples praising God in their own language! Peter, the same Peter who had once been too scared to admit he knew Jesus, stood up and boldly preached. About three thousand people believed in Jesus and were baptised that day.",
          "The Holy Spirit is not a force or a feeling. He is God, the third Person of the Trinity. When we are born again, He comes to live in us. He comforts us, teaches us, reminds us of what Jesus said, helps us pray, gives spiritual gifts, and fills us with power to live for Jesus and tell others about Him. You never have to follow Jesus in your own strength.",
        ],
        verse: simple("And I will ask the Father, and He will give you another Helper, to be with you forever.", "John 14:16"),
        lessons: ["Jesus ascended to heaven, where He prays for us as our High Priest and Advocate.", "The Holy Spirit is God, and He lives in everyone who is born again.", "The Holy Spirit gives us power, gifts and courage to live for Jesus."],
        questions: ["What did the angels promise as Jesus went up into heaven?", "What changed in Peter after he was filled with the Holy Spirit?", "Which of the Holy Spirit’s jobs (comforting, teaching, helping, giving power) do you need most right now?"],
        listen: "Ask the Holy Spirit to fill you. Then be still for two minutes. Ask Him: ‘Holy Spirit, what do you want to teach me or remind me of tonight?’ Write down what you sense, and share it with your parent.",
        prayer: ["Jesus, thank you that you are praying for me right now.", "Holy Spirit, please fill me and help me with…", "Give me courage to tell others about Jesus."],
        mission: { compass: "trust", text: "Tomorrow, before something hard, whisper, ‘Holy Spirit, help me,’ and trust that He is with you." },
        journal: "Draw a flame. Around it, write the things the Holy Spirit does (comforts, teaches, reminds, helps me pray, gives power, gives gifts). Circle the one you want to ask for most.",
      }),
      af: older({
        title: "Krag van Bo", bibleStory: "Handelinge 1 – 2", readPassage: "Handelinge 1:8–11 en 2:1–4",
        story: [
          "Veertig dae lank ná sy opstanding het Jesus aan sy volgelinge verskyn en hulle oor God se koninkryk geleer. Toe het Hy hulle na die Olyfberg gelei. ‘Julle sal krag ontvang wanneer die Heilige Gees oor julle kom,’ het Hy belowe, ‘en julle sal my getuies wees… tot by die uithoeke van die aarde.’ Toe, terwyl hulle kyk, is Hy na die hemel opgeneem, en ’n wolk het Hom uit hulle sig weggeneem.",
          "Terwyl hulle na die lug staan en staar, het twee engele verskyn: ‘Hoekom staan julle en kyk na die lug? Hierdie selfde Jesus wat van julle af na die hemel opgeneem is, sal net so terugkom soos julle Hom sien gaan het.’",
          "Waar is Jesus nou? Die Bybel sê Hy sit aan die regterhand van die Vader, en dat Hy ‘altyd lewe om vir ons te pleit’. Hy is ons Hoëpriester, wat ons swakhede verstaan, en ons Voorspraak, wat by die Vader vir ons praat. Op hierdie oomblik bid Jesus vir jou!",
          "Die dissipels het teruggegaan Jerusalem toe en saam gebid, terwyl hulle gewag het soos Jesus vir hulle gesê het. Tien dae later, op die fees van Pinkster, was hulle almal bymekaar toe daar skielik ’n geluid soos ’n sterk wind uit die hemel gekom het wat die hele huis gevul het. Hulle het iets gesien wat soos tonge van vuur gelyk het, wat op elkeen van hulle kom rus het. ‘Hulle is almal met die Heilige Gees vervul en het in ander tale begin praat soos die Gees hulle laat praat het.’",
          "Mense van baie nasies was in Jerusalem, en elkeen het die dissipels God in hulle eie taal hoor prys! Petrus, dieselfde Petrus wat eens te bang was om te erken hy ken Jesus, het opgestaan en dapper gepreek. Omtrent drieduisend mense het daardie dag in Jesus geglo en is gedoop.",
          "Die Heilige Gees is nie ’n krag of ’n gevoel nie. Hy is God, die derde Persoon van die Drie-eenheid. As ons weergebore word, kom woon Hy in ons. Hy troos ons, leer ons, herinner ons aan wat Jesus gesê het, help ons bid, gee geestelike gawes, en vul ons met krag om vir Jesus te lewe en ander van Hom te vertel. Jy hoef Jesus nooit in jou eie krag te volg nie.",
        ],
        verse: simple("En Ek sal die Vader vra, en Hy sal julle ’n ander Helper gee om vir altyd by julle te wees.", "Johannes 14:16"),
        lessons: ["Jesus het na die hemel opgevaar, waar Hy vir ons bid as ons Hoëpriester en Voorspraak.", "Die Heilige Gees is God, en Hy woon in elkeen wat weergebore is.", "Die Heilige Gees gee ons krag, gawes en moed om vir Jesus te lewe."],
        questions: ["Wat het die engele belowe toe Jesus na die hemel opgeneem is?", "Wat het in Petrus verander nadat hy met die Heilige Gees vervul is?", "Watter van die Heilige Gees se werke (troos, leer, help, krag gee) het jy nou die meeste nodig?"],
        listen: "Vra die Heilige Gees om jou te vul. Wees dan twee minute lank stil. Vra Hom: ‘Heilige Gees, wat wil U my vanaand leer of aan herinner?’ Skryf neer wat jy aanvoel, en deel dit met jou ouer.",
        prayer: ["Jesus, dankie dat U nou vir my bid.", "Heilige Gees, vul my asseblief en help my met…", "Gee my moed om ander van Jesus te vertel."],
        mission: { compass: "trust", text: "Fluister môre, voor iets moeiliks: ‘Heilige Gees, help my,’ en vertrou dat Hy by jou is." },
        journal: "Teken ’n vlam. Skryf rondom dit die dinge wat die Heilige Gees doen (troos, leer, herinner, help my bid, gee krag, gee gawes). Omkring die een waarvoor jy die meeste wil vra.",
      }),
    },
  },

  /* ---------------- Night 47: The Great Commission ---------------- */
  "j01-n47": {
    "2-3": {
      en: toddler({
        title: "Go and Tell!", bibleStory: "Matthew 28",
        story: ["Before Jesus went to heaven, He gave His friends a big job.", "‘Go everywhere! Tell everyone about me!’", "And Jesus made a promise: ‘I am with you always.’", "So they told people, who told more people, who told more people…", "Now someone has told YOU! And Jesus is with you always."],
        verse: simple("I am with you always.", "Matthew 28:20"),
        action: "March on the spot and point all around the world: ‘Go and tell! Go and tell!’ Then hug yourself: ‘Jesus is with me always!’",
        lessons: ["Jesus is with me always, and I can tell others about Him."],
        questions: ["Who can you tell about Jesus?"],
        prayer: ["Dear Jesus,", "thank you that you are always with me. Amen."],
      }),
      af: toddler({
        title: "Gaan en Vertel!", bibleStory: "Matteus 28",
        story: ["Voordat Jesus hemel toe gegaan het, het Hy vir sy vriende ’n groot werk gegee.", "‘Gaan oral heen! Vertel almal van My!’", "En Jesus het ’n belofte gemaak: ‘Ek is altyd by julle.’", "Toe vertel hulle mense, wat meer mense vertel het, wat nog meer mense vertel het…", "Nou het iemand vir JOU vertel! En Jesus is altyd by jou."],
        verse: simple("Ek is altyd by julle.", "Matteus 28:20"),
        action: "Marsjeer op die plek en wys na die hele wêreld: ‘Gaan en vertel! Gaan en vertel!’ Druk jouself dan vas: ‘Jesus is altyd by my!’",
        lessons: ["Jesus is altyd by my, en ek kan ander van Hom vertel."],
        questions: ["Vir wie kan jy van Jesus vertel?"],
        prayer: ["Liewe Jesus,", "dankie dat U altyd by my is. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "The Biggest Mission Ever", bibleStory: "Matthew 28", readPassage: "Matthew 28:16–20",
        story: [
          "Before He returned to heaven, Jesus met His eleven disciples on a mountain in Galilee. When they saw Him, they worshipped Him, although Matthew honestly adds that ‘some doubted’. Even then, Jesus didn’t send the doubters away. He gave the mission to all of them.",
          "Jesus said: ‘All authority in heaven and on earth has been given to me. Therefore go and make disciples of all nations, baptising them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.’",
          "This is called the Great Commission. Look at its three parts. First, Jesus’ authority: He is in charge of everything, so His followers can go with confidence. Second, the mission: make disciples. That doesn’t just mean getting people to say a prayer; it means helping them to follow Jesus, to be baptised and to live His way. Third, the promise: ‘I am with you always.’ We never go on this mission alone.",
          "Think about how impossible it must have seemed: eleven ordinary people, most of them fishermen, told to reach ‘all nations’. But with the Holy Spirit’s power, they did it. They told people, who told more people, who told more people. For two thousand years, the good news has passed from person to person, across oceans, mountains and languages, until one day it reached your family, and now it has reached you.",
          "That makes you part of the story! Being a disciple-maker doesn’t mean you must preach to crowds. It can mean telling a friend what Jesus has done for you, inviting someone to church, praying for a classmate, or simply living in a way that makes people curious about Jesus.",
          "And Jesus’ promise still stands for you tonight: ‘I am with you always.’",
        ],
        verse: simple("And surely I am with you always, to the very end of the age.", "Matthew 28:20"),
        lessons: ["Jesus has all authority, and He sends His followers to make disciples of all nations.", "The good news has passed from person to person for 2,000 years, all the way to you.", "Jesus is with us always as we share His love with others."],
        questions: ["What are the three parts of the Great Commission?", "Why do you think Jesus gave the mission even to the disciples who doubted?", "Who told your family about Jesus? Who could you tell?"],
        listen: "Ask Jesus: ‘Who do you want me to share your love with?’ Be still and listen. Write down the name or names that come to mind.",
        prayer: ["Jesus, thank you that you have all authority and you are always with me.", "Please give me courage to share your love with…", "Thank you for the people who told my family about you."],
        mission: { compass: "love", text: "Tell one friend something about Jesus tomorrow, or invite them to church or a kids’ club." },
        journal: "Draw a chain of people from Jesus to you. Ask your parent who told your family about Jesus and add their names to the chain. Then draw one more link for someone you will tell.",
      }),
      af: older({
        title: "Die Grootste Opdrag Ooit", bibleStory: "Matteus 28", readPassage: "Matteus 28:16–20",
        story: [
          "Voordat Hy hemel toe teruggegaan het, het Jesus sy elf dissipels op ’n berg in Galilea ontmoet. Toe hulle Hom sien, het hulle Hom aanbid, al voeg Matteus eerlik by dat ‘party getwyfel het’. Selfs toe het Jesus die twyfelaars nie weggestuur nie. Hy het die opdrag aan almal gegee.",
          "Jesus het gesê: ‘Aan My is gegee alle mag in die hemel en op die aarde. Gaan dan en maak dissipels van al die nasies, en doop hulle in die Naam van die Vader en die Seun en die Heilige Gees, en leer hulle om alles te doen wat Ek julle beveel het. En onthou: Ek is by julle al die dae tot aan die einde.’",
          "Dit word die Groot Opdrag genoem. Kyk na sy drie dele. Eerstens, Jesus se mag: Hy is in beheer van alles, so sy volgelinge kan met selfvertroue gaan. Tweedens, die opdrag: maak dissipels. Dit beteken nie net om mense ’n gebed te laat bid nie; dit beteken om hulle te help om Jesus te volg, gedoop te word en op sy manier te lewe. Derdens, die belofte: ‘Ek is by julle al die dae.’ Ons gaan nooit alleen op hierdie opdrag nie.",
          "Dink hoe onmoontlik dit moes gelyk het: elf gewone mense, meeste van hulle vissermanne, wat gesê word om ‘al die nasies’ te bereik. Maar met die Heilige Gees se krag het hulle dit gedoen. Hulle het mense vertel, wat meer mense vertel het, wat nog meer mense vertel het. Twee duisend jaar lank is die goeie nuus van mens tot mens oorgedra, oor oseane, berge en tale, totdat dit eendag jou familie bereik het, en nou het dit jou bereik.",
          "Dit maak jou deel van die storie! Om dissipels te maak beteken nie jy moet vir skares preek nie. Dit kan beteken om vir ’n maat te vertel wat Jesus vir jou gedoen het, iemand kerk toe te nooi, vir ’n klasmaat te bid, of net so te lewe dat mense nuuskierig raak oor Jesus.",
          "En Jesus se belofte staan vanaand nog vir jou: ‘Ek is by julle al die dae.’",
        ],
        verse: simple("En onthou: Ek is by julle al die dae tot aan die einde.", "Matteus 28:20"),
        lessons: ["Jesus het alle mag, en Hy stuur sy volgelinge om dissipels van al die nasies te maak.", "Die goeie nuus is 2 000 jaar lank van mens tot mens oorgedra, tot by jou.", "Jesus is altyd by ons as ons sy liefde met ander deel."],
        questions: ["Wat is die drie dele van die Groot Opdrag?", "Hoekom dink jy het Jesus die opdrag selfs aan die dissipels gegee wat getwyfel het?", "Wie het jou familie van Jesus vertel? Vir wie kan jy vertel?"],
        listen: "Vra Jesus: ‘Met wie wil U hê moet ek u liefde deel?’ Wees stil en luister. Skryf die naam of name neer wat opkom.",
        prayer: ["Jesus, dankie dat U alle mag het en altyd by my is.", "Gee my asseblief moed om u liefde te deel met…", "Dankie vir die mense wat my familie van U vertel het."],
        mission: { compass: "love", text: "Vertel môre vir een maat iets oor Jesus, of nooi hulle na die kerk of ’n kinderklub." },
        journal: "Teken ’n ketting van mense van Jesus af tot by jou. Vra jou ouer wie jou familie van Jesus vertel het, en voeg hulle name by die ketting. Teken dan nog een skakel vir iemand vir wie jy gaan vertel.",
      }),
    },
  },

  /* ---------------- Night 48: Grand Campfire (finale) ---------------- */
  "j01-n48": {
    "2-3": {
      en: toddler({
        title: "Grand Campfire",
        story: ["You did it, little explorer! You walked the whole trail!", "God made you. God loves you. Jesus is your friend. Jesus is alive!", "And one happy day, Jesus is coming back! We will see Him face to face!", "You are a child of God and a friend of Jesus!"],
        game: "Treasure parade: march around the room holding a torch like a lantern, and shout a different thing God is at each step: ‘God is good! God is strong! God loves me!’",
        lessons: [], questions: ["What do you love most about God?"],
        prayer: ["Dear God,", "thank you for loving me. I love you too. Amen."],
      }),
      af: toddler({
        title: "Groot Kampvuur",
        story: ["Jy het dit gedoen, klein ontdekker! Jy het die hele pad gestap!", "God het jou gemaak. God is lief vir jou. Jesus is jou vriend. Jesus leef!", "En op ’n blye dag kom Jesus terug! Ons sal Hom van aangesig tot aangesig sien!", "Jy is ’n kind van God en ’n vriend van Jesus!"],
        game: "Skatparade: marsjeer om die kamer met ’n flitslig soos ’n lantern, en skree by elke tree iets anders wat God is: ‘God is goed! God is sterk! God is lief vir my!’",
        lessons: [], questions: ["Waarvoor is jy die liefste van God?"],
        prayer: ["Liewe God,", "dankie dat U my liefhet. Ek het U ook lief. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Grand Campfire: The Adventure Has Only Begun",
        story: [
          "You’ve walked the whole trail! From the garden to the empty tomb, you have discovered treasure after treasure about who God is: Creator, Holy, Mighty, Provider, Good, Shepherd, King, Merciful, Healer, Father, Friend, Saviour and Helper.",
          "But the story isn’t over. The angels promised: ‘This same Jesus… will come back.’ One day, maybe sooner than we think, Jesus will return in person. Every sad thing will be made right. There will be no more tears, no more pain and no more death. Everyone who belongs to Jesus will see Him face to face and live with Him forever.",
          "That isn’t something to be afraid of. For God’s children, it is the happiest day ahead: like waiting for your best friend to come home. Until then, we live as His children: talking with Him, listening to Him, trusting Him and loving Him and others. The adventure has only begun.",
        ],
        game: "Treasure hunt review: scroll through the Trail Map together. Each pick your three favourite treasures, and tell each other why you chose them.",
        lessons: [],
        questions: ["What is the most important thing you have learned about God on this trail?", "How do you feel about Jesus coming back? Why is it good news for God’s children?", "What would you like your friendship with God to look like next year?"],
        prayer: ["God, thank you for everything you have shown me on this trail.", "Thank you that Jesus is coming back, and I will see Him face to face.", "Until then, I want to know you better every day, especially…"],
        mission: { compass: "talk", text: "Keep using the Friendship Compass every day: Talk, Listen, Trust and Love." },
        journal: "Write a letter to yourself to read at the end of next year: what you know about God now, and what you hope your friendship with Him will be like.",
      }),
      af: older({
        title: "Groot Kampvuur: Die Avontuur Begin Eers",
        story: [
          "Jy het die hele pad gestap! Van die tuin tot by die leë graf het jy skat ná skat ontdek oor wie God is: Skepper, Heilig, Magtig, Voorsiener, Goed, Herder, Koning, Genadig, Geneser, Vader, Vriend, Verlosser en Helper.",
          "Maar die storie is nog nie klaar nie. Die engele het belowe: ‘Hierdie selfde Jesus… sal terugkom.’ Eendag, dalk gouer as wat ons dink, sal Jesus self terugkom. Elke hartseer ding sal reggemaak word. Daar sal nie meer trane, pyn of dood wees nie. Almal wat aan Jesus behoort, sal Hom van aangesig tot aangesig sien en vir altyd saam met Hom lewe.",
          "Dit is nie iets om voor bang te wees nie. Vir God se kinders is dit die blydste dag wat voorlê: soos om te wag dat jou beste vriend huis toe kom. Tot dan lewe ons as sy kinders: ons praat met Hom, luister na Hom, vertrou Hom, en het Hom en ander lief. Die avontuur het eers begin.",
        ],
        game: "Skatjag-hersiening: blaai saam deur die Roetekaart. Kies elkeen julle drie gunstelingskatte, en vertel mekaar hoekom julle hulle gekies het.",
        lessons: [],
        questions: ["Wat is die belangrikste ding wat jy op hierdie pad oor God geleer het?", "Hoe voel jy daaroor dat Jesus terugkom? Hoekom is dit goeie nuus vir God se kinders?", "Hoe wil jy hê moet jou vriendskap met God volgende jaar lyk?"],
        prayer: ["God, dankie vir alles wat U my op hierdie pad gewys het.", "Dankie dat Jesus terugkom, en dat ek Hom van aangesig tot aangesig sal sien.", "Tot dan wil ek U elke dag beter leer ken, veral…"],
        mission: { compass: "talk", text: "Gebruik elke dag die Vriendskapskompas: Praat, Luister, Vertrou en Liefhê." },
        journal: "Skryf ’n brief aan jouself om aan die einde van volgende jaar te lees: wat jy nou oor God weet, en hoe jy hoop jou vriendskap met Hom sal wees.",
      }),
    },
  },
};
