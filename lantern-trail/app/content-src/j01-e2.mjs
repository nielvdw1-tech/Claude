/**
 * Journey Trail 1, Expedition 2 (The Great Rescue Road): ages 2–3 and 8–9, English and Afrikaans.
 * Status: DRAFT, awaiting review (see docs/CONTENT-GUIDE.md section 7).
 */
const simple = (text, refText) => ({ text, refText, wording: "simple" });
const toddler = (o) => ({ prayerStyle: "repeat", ...o });
const older = (o) => ({ prayerStyle: "own", ...o });

export default {
  /* ---------------- Night 8: Baby Moses ---------------- */
  "j01-n08": {
    "2-3": {
      en: toddler({
        title: "Baby in a Basket", bibleStory: "Exodus 2",
        story: ["A mummy had a baby boy. A bad king wanted to hurt him.", "So the mummy made a little basket, like a boat.", "She put her baby inside and let it float on the river. Splish, splash!", "His big sister Miriam watched. Then a princess found the baby. ‘I will look after him!’", "God kept baby Moses safe."],
        verse: simple("God watches over me.", "Psalm 121:8"),
        action: "Rock a pretend baby in your arms. Then float your hands like a little boat on the water.",
        lessons: ["God watches over me, day and night."],
        questions: ["Who looks after you? (Mommy, Daddy… and God!)"],
        prayer: ["Thank you, God,", "for keeping me safe. Amen."],
      }),
      af: toddler({
        title: "Baba in ’n Mandjie", bibleStory: "Eksodus 2",
        story: ["’n Mamma het ’n babaseuntjie gehad. ’n Slegte koning wou hom seermaak.", "Toe maak die mamma ’n mandjie, soos ’n bootjie.", "Sy sit haar baba daarin en laat dit op die rivier dryf. Plas, plas!", "Sy groot sussie Mirjam het gekyk. Toe kry ’n prinses die baba. ‘Ek sal na hom kyk!’", "God het baba Moses veilig gehou."],
        verse: simple("God pas my op.", "Psalm 121:8"),
        action: "Wieg ’n kamma-baba in jou arms. Laat dan jou hande soos ’n bootjie op die water dryf.",
        lessons: ["God pas my op, dag en nag."],
        questions: ["Wie kyk na jou? (Mamma, Pappa… en God!)"],
        prayer: ["Dankie, God,", "dat U my veilig hou. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Hidden in the Reeds", bibleStory: "Exodus 1 – 2", readPassage: "Exodus 2:1–10",
        story: [
          "Many years after Joseph, God’s people, the Israelites, had grown into a huge nation in Egypt. A new Pharaoh came to power who didn’t care about Joseph or his God. He was afraid of the Israelites, so he made them slaves. When that didn’t stop them growing, he gave a terrible order: every baby boy must be thrown into the Nile River.",
          "One Israelite mother, Jochebed, had a baby boy. She saw that he was special, and she hid him for three months. When she couldn’t hide him any longer, she wove a basket out of reeds, coated it with tar so it would float, laid her son inside, and placed it among the reeds at the edge of the Nile. His big sister, Miriam, hid nearby to watch.",
          "Then Pharaoh’s own daughter came down to the river to bathe. She saw the basket, opened it, and the baby started to cry. She felt sorry for him. ‘This is one of the Hebrew babies,’ she said. Brave Miriam stepped out: ‘Shall I find a Hebrew woman to feed the baby for you?’ The princess said yes, and Miriam ran to fetch… the baby’s own mother!",
          "So Jochebed got to raise her son, and was even paid for it! When he was older, the princess adopted him and named him Moses, which sounds like ‘drawn out’, because she drew him out of the water.",
          "Notice that God isn’t mentioned once in these ten verses. But He was working in every detail: a mother’s courage, a sister’s quick thinking, a princess’s kind heart. The very river that was meant to destroy Moses became the place where God saved him. God was protecting the one He would later use to rescue His whole people.",
        ],
        verse: simple("The Lord will watch over your coming and going, now and forever.", "Psalm 121:8"),
        lessons: ["God watches over His children, even when we can’t see Him working.", "God uses ordinary people’s courage and kindness in His plans.", "God can turn the very thing meant for harm into a place of rescue."],
        questions: ["Who were the three women who helped save Moses?", "Why do you think God isn’t mentioned in this story, even though He was clearly at work?", "When have you seen God take care of you, maybe through other people?"],
        listen: "Be still for one minute. Ask God: ‘How have you been watching over me?’ Listen. Maybe a memory or a person will come to mind. Thank God for it.",
        prayer: ["Father, thank you that you watch over me every moment.", "Thank you for the people you use to care for me, like…", "Help me to trust you even when I can’t see you working."],
        mission: { compass: "trust", text: "Tomorrow, whenever you feel worried, remind yourself: ‘God is watching over me, just like He watched over Moses.’" },
        journal: "Draw the basket in the reeds. Around it, write the names of people God has used to look after you.",
      }),
      af: older({
        title: "Weggesteek in die Riete", bibleStory: "Eksodus 1 – 2", readPassage: "Eksodus 2:1–10",
        story: [
          "Baie jare ná Josef het God se mense, die Israeliete, in Egipte ’n groot volk geword. ’n Nuwe Farao het koning geword wat nie vir Josef of sy God omgegee het nie. Hy was bang vir die Israeliete, toe maak hy hulle slawe. Toe hulle steeds meer word, het hy ’n verskriklike bevel gegee: elke babaseuntjie moet in die Nylrivier gegooi word.",
          "Een Israelitiese ma, Jogebed, het ’n babaseuntjie gehad. Sy het gesien hy is spesiaal, en sy het hom drie maande lank weggesteek. Toe sy hom nie langer kon wegsteek nie, het sy ’n mandjie van riete gevleg, dit met teer gesmeer sodat dit kon dryf, haar seun daarin gelê en dit tussen die riete langs die Nyl neergesit. Sy groot sus, Mirjam, het naby weggekruip om te kyk.",
          "Toe kom Farao se eie dogter na die rivier om te bad. Sy sien die mandjie, maak dit oop, en die baba begin huil. Sy het jammer vir hom gevoel. ‘Dit is een van die Hebreeuse babas,’ het sy gesê. Dapper Mirjam het nader gestap: ‘Moet ek ’n Hebreeuse vrou gaan soek om die baba vir u te voed?’ Die prinses het ja gesê, en Mirjam het gehardloop om… die baba se eie ma te gaan haal!",
          "So het Jogebed haar eie seun grootgemaak, en sy is selfs daarvoor betaal! Toe hy ouer was, het die prinses hom aangeneem en hom Moses genoem, wat klink soos ‘uitgetrek’, want sy het hom uit die water getrek.",
          "Let op dat God nie een keer in hierdie tien verse genoem word nie. Tog was Hy in elke klein dingetjie aan die werk: ’n ma se moed, ’n sussie se slim plan, ’n prinses se goeie hart. Die einste rivier wat Moses moes doodmaak, het die plek geword waar God hom gered het. God het die een beskerm wat Hy later sou gebruik om sy hele volk te red.",
        ],
        verse: simple("Die Here pas jou op as jy kom en as jy gaan, nou en vir altyd.", "Psalm 121:8"),
        lessons: ["God pas sy kinders op, selfs as ons Hom nie sien werk nie.", "God gebruik gewone mense se moed en goedheid in sy planne.", "God kan juis die ding wat ons moes seermaak, in ’n plek van redding verander."],
        questions: ["Wie was die drie vroue wat gehelp het om Moses te red?", "Hoekom dink jy word God nie in hierdie storie genoem nie, al was Hy duidelik aan die werk?", "Wanneer het jy al gesien hoe God na jou kyk, dalk deur ander mense?"],
        listen: "Wees een minuut lank stil. Vra God: ‘Hoe het U my opgepas?’ Luister. Dalk kom ’n herinnering of ’n mens in jou gedagtes op. Sê dankie vir God daarvoor.",
        prayer: ["Vader, dankie dat U my elke oomblik oppas.", "Dankie vir die mense wat U gebruik om na my te kyk, soos…", "Help my om U te vertrou, selfs as ek nie sien hoe U werk nie."],
        mission: { compass: "trust", text: "As jy môre bekommerd voel, sê vir jouself: ‘God pas my op, net soos Hy Moses opgepas het.’" },
        journal: "Teken die mandjie in die riete. Skryf rondom dit die name van mense wat God gebruik het om na jou te kyk.",
      }),
    },
  },

  /* ---------------- Night 9: The burning bush ---------------- */
  "j01-n09": {
    "2-3": {
      en: toddler({
        title: "The Bush on Fire", bibleStory: "Exodus 3",
        story: ["Moses looked after sheep. Baa, baa!", "One day he saw a bush on fire. Crackle, crackle! But the bush did not burn up!", "God called from the bush: ‘Moses! Moses!’", "‘Take off your shoes,’ said God. ‘This is a special place.’", "God is so special. There is no one like God!"],
        verse: simple("Holy, holy, holy is God.", "Isaiah 6:3"),
        action: "Pretend to take off your shoes very slowly and quietly. Then whisper: ‘God is special.’",
        lessons: ["God is special. There is no one like Him."],
        questions: ["What sound does a sheep make?"],
        prayer: ["Dear God,", "you are so special. I love you. Amen."],
      }),
      af: toddler({
        title: "Die Bos wat Brand", bibleStory: "Eksodus 3",
        story: ["Moses het na skape gekyk. Mê, mê!", "Eendag sien hy ’n bos wat brand. Knetter, knetter! Maar die bos brand nie op nie!", "God het uit die bos geroep: ‘Moses! Moses!’", "‘Trek jou skoene uit,’ het God gesê. ‘Dit is ’n spesiale plek.’", "God is so spesiaal. Daar is niemand soos God nie!"],
        verse: simple("Heilig, heilig, heilig is God.", "Jesaja 6:3"),
        action: "Maak of jy jou skoene baie stadig en stil uittrek. Fluister dan: ‘God is spesiaal.’",
        lessons: ["God is spesiaal. Daar is niemand soos Hy nie."],
        questions: ["Watter geluid maak ’n skaap?"],
        prayer: ["Liewe God,", "U is so spesiaal. Ek is lief vir U. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Holy Ground", bibleStory: "Exodus 3", readPassage: "Exodus 3:1–15",
        story: [
          "Moses grew up as a prince in Pharaoh’s palace, but he never forgot that he was an Israelite. One day, when he was forty, he saw an Egyptian beating an Israelite slave. Moses killed the Egyptian, and had to run for his life into the desert. For the next forty years he worked as a shepherd, far from Egypt. He probably thought God had forgotten all about him.",
          "Then one day, near Mount Sinai, Moses saw something strange: a bush blazing with fire, yet it wasn’t burning up. As he went closer, God called to him from the bush: ‘Moses! Moses!’ God knew his name. ‘Do not come any closer,’ God said. ‘Take off your sandals, for the place where you are standing is holy ground.’",
          "Holy means set apart, completely pure, and utterly different from anything else. God is not just a bigger, stronger person. He is perfectly good, with no darkness in Him at all. Moses hid his face, because he was afraid to look at God.",
          "But God hadn’t come to scare Moses away. He had come with a message of love: ‘I have seen the misery of my people in Egypt. I have heard them crying out. I am concerned about their suffering, and I have come down to rescue them.’ The holy God cared deeply about His hurting people, and He was sending Moses to lead them out.",
          "Moses asked, ‘What is your name?’ God answered, ‘I AM WHO I AM.’ God didn’t begin, and He will never end. He doesn’t need anything or anyone. And yet this great, holy God chose to come close, call a shepherd by name and rescue slaves. Because of Jesus, we can come close to this holy God too, not in fear but as His children.",
        ],
        verse: simple("Holy, holy, holy is the Lord Almighty.", "Isaiah 6:3"),
        lessons: ["God is holy: perfectly pure and good, with no one like Him.", "The holy God sees, hears and cares about people who are suffering.", "Because of Jesus, we can come close to the holy God as His children."],
        questions: ["Why did God tell Moses to take off his sandals?", "What does God’s name, ‘I AM WHO I AM’, tell us about Him?", "How does it feel to know that the holy God also knows your name and cares about you?"],
        listen: "Take a moment to be very still, as if you were standing on holy ground. Tell God: ‘You are holy.’ Then ask: ‘What do you want to say to me?’ Listen quietly.",
        prayer: ["Holy God, there is no one like you.", "Thank you that you see and care about…", "Thank you that because of Jesus I can come close to you."],
        mission: { compass: "love", text: "Tomorrow, find a quiet moment to worship God: sing a song or simply tell Him why He is wonderful." },
        journal: "Write down five words that describe God after reading this story. Which one means the most to you, and why?",
      }),
      af: older({
        title: "Heilige Grond", bibleStory: "Eksodus 3", readPassage: "Eksodus 3:1–15",
        story: [
          "Moses het as ’n prins in Farao se paleis grootgeword, maar hy het nooit vergeet dat hy ’n Israeliet is nie. Eendag, toe hy veertig was, het hy gesien hoe ’n Egiptenaar ’n Israelitiese slaaf slaan. Moses het die Egiptenaar doodgemaak, en hy moes vir sy lewe na die woestyn vlug. Die volgende veertig jaar het hy as ’n skaapwagter gewerk, ver van Egipte af. Hy het seker gedink God het van hom vergeet.",
          "Toe, op ’n dag naby die berg Sinai, sien Moses iets vreemds: ’n bos wat helder brand, maar dit brand nie op nie. Toe hy nader gaan, het God uit die bos na hom geroep: ‘Moses! Moses!’ God het sy naam geken. ‘Moenie nader kom nie,’ het God gesê. ‘Trek jou sandale uit, want die plek waar jy staan, is heilige grond.’",
          "Heilig beteken apart, heeltemal rein, en totaal anders as enigiets anders. God is nie net ’n groter, sterker mens nie. Hy is volmaak goed, sonder enige donkerte in Hom. Moses het sy gesig weggesteek, want hy was bang om na God te kyk.",
          "Maar God het nie gekom om Moses weg te skrik nie. Hy het met ’n boodskap van liefde gekom: ‘Ek het gesien hoe swaar my volk in Egipte kry. Ek het hulle hoor roep. Ek gee om oor hulle pyn, en Ek het afgekom om hulle te red.’ Die heilige God het baie omgegee vir sy mense wat seerkry, en Hy het Moses gestuur om hulle uit te lei.",
          "Moses het gevra: ‘Wat is u naam?’ God het geantwoord: ‘EK IS WIE EK IS.’ God het nie begin nie, en Hy sal nooit eindig nie. Hy het niks en niemand nodig nie. En tog het hierdie groot, heilige God gekies om naby te kom, ’n skaapwagter op sy naam te roep en slawe te red. Danksy Jesus kan ons ook naby aan hierdie heilige God kom, nie bang nie, maar as sy kinders.",
        ],
        verse: simple("Heilig, heilig, heilig is die Here, die Almagtige.", "Jesaja 6:3"),
        lessons: ["God is heilig: volmaak rein en goed, en daar is niemand soos Hy nie.", "Die heilige God sien, hoor en gee om vir mense wat swaarkry.", "Danksy Jesus kan ons as sy kinders naby aan die heilige God kom."],
        questions: ["Hoekom het God vir Moses gesê om sy sandale uit te trek?", "Wat sê God se naam, ‘EK IS WIE EK IS’, vir ons oor Hom?", "Hoe voel dit om te weet die heilige God ken ook jou naam en gee om vir jou?"],
        listen: "Wees ’n oomblik baie stil, asof jy op heilige grond staan. Sê vir God: ‘U is heilig.’ Vra dan: ‘Wat wil U vir my sê?’ Luister stil.",
        prayer: ["Heilige God, daar is niemand soos U nie.", "Dankie dat U sien en omgee oor…", "Dankie dat ek danksy Jesus naby aan U kan kom."],
        mission: { compass: "love", text: "Kry môre ’n stil oomblik om God te aanbid: sing ’n lied of sê net vir Hom hoekom Hy wonderlik is." },
        journal: "Skryf vyf woorde neer wat God beskryf nadat jy hierdie storie gelees het. Watter een beteken die meeste vir jou, en hoekom?",
      }),
    },
  },

  /* ---------------- Night 10: The Red Sea ---------------- */
  "j01-n10": {
    "2-3": {
      en: toddler({
        title: "A Path Through the Sea", bibleStory: "Exodus 14",
        story: ["God’s people were running away from a bad king.", "Oh no! The big sea was in front of them!", "Moses held up his stick. Whoosh! God made the sea open up!", "The water stood up like big walls. God’s people walked through on dry ground.", "God saved them! They sang and danced: ‘Hooray for God!’"],
        verse: simple("God will fight for you.", "Exodus 14:14"),
        action: "Put your hands together, then push them wide apart like the sea opening. Whoosh! Then walk through the middle.",
        lessons: ["God is strong. God saves me."],
        questions: ["Can you dance and sing ‘Hooray for God’?"],
        prayer: ["Thank you, God,", "you are so strong! Amen."],
      }),
      af: toddler({
        title: "’n Pad deur die See", bibleStory: "Eksodus 14",
        story: ["God se mense het weggehardloop van ’n slegte koning.", "O nee! Die groot see was voor hulle!", "Moses het sy stok opgehou. Woesj! God het die see laat oopgaan!", "Die water het soos groot mure gestaan. God se mense het op droë grond deurgeloop.", "God het hulle gered! Hulle het gesing en gedans: ‘Hoera vir God!’"],
        verse: simple("God sal vir jou veg.", "Eksodus 14:14"),
        action: "Sit jou hande teen mekaar, en druk hulle dan wyd oop soos die see wat oopgaan. Woesj! Loop dan deur die middel.",
        lessons: ["God is sterk. God red my."],
        questions: ["Kan jy dans en sing ‘Hoera vir God’?"],
        prayer: ["Dankie, God,", "U is so sterk! Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "The Lord Will Fight for You", bibleStory: "Exodus 12 – 15", readPassage: "Exodus 14:10–31",
        story: [
          "Moses went back to Egypt and told Pharaoh, ‘The Lord says: Let my people go!’ Pharaoh refused, again and again. So God sent ten plagues on Egypt. The last one was the most terrible: the firstborn son in every house would die. But God gave His people a way to be safe. Each family was to sacrifice a lamb and paint its blood on their doorframe. When death passed through Egypt that night, it passed over every house marked by the blood. That is why it is called the Passover, and it is a picture of Jesus, the Lamb of God, whose blood keeps us safe.",
          "Finally Pharaoh let them go. Hundreds of thousands of Israelites marched out of Egypt, free. God led them with a pillar of cloud by day and a pillar of fire by night.",
          "But then Pharaoh changed his mind and chased them with six hundred chariots. The Israelites were trapped: the Red Sea in front of them, the Egyptian army behind them. They panicked and cried out, ‘Why did you bring us out here to die?’",
          "Moses answered with some of the bravest words in the Bible: ‘Do not be afraid. Stand firm and you will see the deliverance the Lord will bring you today. The Lord will fight for you; you need only to be still.’",
          "God told Moses to stretch out his staff over the sea. All night a strong east wind blew, and the sea split in two, with a wall of water on the right and on the left. The Israelites walked through on dry ground! When the Egyptians followed, the water came crashing back. God’s people stood on the other shore, saved, and they sang a song of praise to the God who had rescued them.",
          "Sometimes we feel trapped too, with a problem in front and fear behind. God doesn’t always split seas, but He is still the God who fights for His children.",
        ],
        verse: simple("The Lord will fight for you; you need only to be still.", "Exodus 14:14"),
        lessons: ["God is mighty: He rescues His people when there seems to be no way out.", "The Passover lamb points to Jesus, whose blood keeps us safe.", "When we are afraid, we can be still and trust God to fight for us."],
        questions: ["What kept the Israelite families safe on the night of the Passover?", "How is Jesus like the Passover lamb?", "What is a ‘Red Sea’ problem you are facing? What would it look like to ‘be still’ and trust God with it?"],
        listen: "Sit very still for one minute. Bring God the thing that worries you most. Ask: ‘Lord, how will you fight for me in this?’ Listen, and share what you sense with your parent.",
        prayer: ["Mighty God, you made a way through the sea.", "Please fight for me in…", "Thank you for Jesus, the Lamb who keeps me safe."],
        mission: { compass: "trust", text: "Tomorrow, when you feel stuck or scared, take a deep breath and say Exodus 14:14 out loud." },
        journal: "Draw the walls of water with a path through the middle. On the path, write a problem you are trusting God with.",
      }),
      af: older({
        title: "Die Here Sal vir Jou Veg", bibleStory: "Eksodus 12 – 15", readPassage: "Eksodus 14:10–31",
        story: [
          "Moses het teruggegaan Egipte toe en vir Farao gesê: ‘Die Here sê: Laat my volk gaan!’ Farao het keer op keer geweier. Toe stuur God tien plae oor Egipte. Die laaste een was die verskriklikste: die oudste seun in elke huis sou sterf. Maar God het vir sy mense ’n manier gegee om veilig te wees. Elke familie moes ’n lam slag en sy bloed aan hulle deurkosyn smeer. Toe die dood daardie nag deur Egipte gaan, het dit by elke huis met die bloed verbygegaan. Daarom word dit die Pasga genoem, en dit is ’n prentjie van Jesus, die Lam van God, wie se bloed ons veilig hou.",
          "Eindelik het Farao hulle laat gaan. Honderde duisende Israeliete het vry uit Egipte gestap. God het hulle bedags met ’n wolkkolom en snags met ’n vuurkolom gelei.",
          "Maar toe verander Farao van plan en jaag hulle agterna met seshonderd strydwaens. Die Israeliete was vasgekeer: die Rooi See voor hulle, die Egiptiese leër agter hulle. Hulle het paniekerig geword en uitgeroep: ‘Hoekom het jy ons hierheen gebring om dood te gaan?’",
          "Moses het met van die dapperste woorde in die Bybel geantwoord: ‘Moenie bang wees nie. Staan vas, en julle sal sien hoe die Here julle vandag red. Die Here sal vir julle veg; julle hoef net stil te wees.’",
          "God het vir Moses gesê om sy staf oor die see uit te steek. Die hele nag het ’n sterk oostewind gewaai, en die see het in twee verdeel, met ’n muur van water aan die regterkant en aan die linkerkant. Die Israeliete het op droë grond deurgeloop! Toe die Egiptenare agterna kom, het die water teruggestort. God se mense het aan die ander kant gestaan, gered, en hulle het ’n lofliedjie gesing vir die God wat hulle gered het.",
          "Soms voel ons ook vasgekeer, met ’n probleem voor ons en vrees agter ons. God verdeel nie altyd seë nie, maar Hy is steeds die God wat vir sy kinders veg.",
        ],
        verse: simple("Die Here sal vir julle veg; julle hoef net stil te wees.", "Eksodus 14:14"),
        lessons: ["God is magtig: Hy red sy mense as dit lyk of daar geen uitweg is nie.", "Die Pasga-lam wys na Jesus, wie se bloed ons veilig hou.", "As ons bang is, kan ons stil wees en God vertrou om vir ons te veg."],
        questions: ["Wat het die Israelitiese families op die Pasga-nag veilig gehou?", "Hoe is Jesus soos die Pasga-lam?", "Wat is ’n ‘Rooi See’-probleem wat jy het? Hoe sal dit lyk om ‘stil te wees’ en God daarmee te vertrou?"],
        listen: "Sit een minuut lank baie stil. Bring vir God die ding wat jou die meeste bekommer. Vra: ‘Here, hoe gaan U hierin vir my veg?’ Luister, en vertel jou ouer wat jy aanvoel.",
        prayer: ["Magtige God, U het ’n pad deur die see gemaak.", "Veg asseblief vir my in…", "Dankie vir Jesus, die Lam wat my veilig hou."],
        mission: { compass: "trust", text: "As jy môre vasgekeer of bang voel, haal diep asem en sê Eksodus 14:14 hardop." },
        journal: "Teken die mure van water met ’n pad deur die middel. Skryf op die pad ’n probleem waarmee jy God vertrou.",
      }),
    },
  },

  /* ---------------- Night 11: Manna ---------------- */
  "j01-n11": {
    "2-3": {
      en: toddler({
        title: "Bread from the Sky", bibleStory: "Exodus 16",
        story: ["God’s people walked and walked in the hot desert.", "Their tummies rumbled. ‘We are hungry!’", "In the morning, there was white bread on the ground, like snow!", "Yummy! It tasted like honey biscuits.", "Every day God gave them food. God gives us what we need."],
        verse: simple("God gives me what I need.", "Philippians 4:19"),
        action: "Rub your tummy and say ‘Yum, yum!’ Then pretend to pick up bread from the ground and put it in a basket.",
        lessons: ["God gives me what I need."],
        questions: ["What is your favourite food? Let’s thank God for it!"],
        prayer: ["Thank you, God,", "for my yummy food. Amen."],
      }),
      af: toddler({
        title: "Brood uit die Hemel", bibleStory: "Eksodus 16",
        story: ["God se mense het geloop en geloop in die warm woestyn.", "Hulle maagies het gegrom. ‘Ons is honger!’", "Die oggend was daar wit brood op die grond, soos sneeu!", "Lekker! Dit het soos heuningkoekies gesmaak.", "Elke dag het God vir hulle kos gegee. God gee vir ons wat ons nodig het."],
        verse: simple("God gee my wat ek nodig het.", "Filippense 4:19"),
        action: "Vryf jou maag en sê ‘Lekker, lekker!’ Maak dan of jy brood van die grond optel en in ’n mandjie sit.",
        lessons: ["God gee my wat ek nodig het."],
        questions: ["Wat is jou gunstelingkos? Kom ons sê dankie vir God daarvoor!"],
        prayer: ["Dankie, God,", "vir my lekker kos. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Enough for Today", bibleStory: "Exodus 16", readPassage: "Exodus 16:1–5, 13–21",
        story: [
          "Only six weeks after God split the Red Sea, the Israelites were in the desert, and they were hungry. Instead of asking God for help, they grumbled: ‘If only we had died in Egypt! There we had pots of meat and all the bread we wanted!’ They had already forgotten how terrible slavery had been, and how mighty God had been.",
          "God could have been angry, but instead He was generous. ‘I will rain down bread from heaven for you,’ He told Moses. That evening, flocks of quail birds covered the camp, so they had meat. The next morning, when the dew dried, the ground was covered with thin white flakes like frost. ‘What is it?’ the people asked. In Hebrew that is ‘man hu?’, so they called it manna. It tasted like wafers made with honey.",
          "God gave simple instructions: collect just enough for each person for one day. Some people didn’t trust God, so they kept extra overnight. In the morning it was full of maggots and smelled terrible! But on the sixth day God told them to collect double, so they could rest on the Sabbath, and that manna stayed fresh. For forty years God never missed a single morning.",
          "Why only enough for one day? Because God was teaching His people to depend on Him daily, like children who trust their father to put food on the table. That is why Jesus taught us to pray, ‘Give us today our daily bread.’",
          "Later Jesus said something amazing: ‘I am the bread of life. Whoever comes to me will never go hungry.’ The manna kept people alive for a day. Jesus gives us life with God that lasts forever.",
        ],
        verse: simple("My God will meet all your needs.", "Philippians 4:19"),
        lessons: ["God is our Provider: He gives His children what they need.", "God wants us to depend on Him every day, like children trust a good father.", "Jesus is the bread of life who gives us life with God forever."],
        questions: ["Why did the manna go bad when people kept extra?", "Why do you think God gave just enough for one day at a time?", "Instead of grumbling, what could the Israelites have done when they were hungry? What can you do when you’re worried about something?"],
        listen: "Be still and ask God: ‘What do I need from you today?’ Listen. Then thank Him that He already knows and cares.",
        prayer: ["Father, thank you for giving me what I need every day, like…", "Help me to trust you instead of grumbling.", "Thank you that Jesus is the bread of life."],
        mission: { compass: "talk", text: "Before every meal tomorrow, thank God for your food. And if you catch yourself grumbling, change it into a thank-you." },
        journal: "Make two columns: ‘Things I need’ and ‘Things I want’. What do you notice? Thank God for everything on the first list.",
      }),
      af: older({
        title: "Genoeg vir Vandag", bibleStory: "Eksodus 16", readPassage: "Eksodus 16:1–5, 13–21",
        story: [
          "Net ses weke nadat God die Rooi See verdeel het, was die Israeliete in die woestyn, en hulle was honger. In plaas daarvan om God om hulp te vra, het hulle gekla: ‘As ons maar net in Egipte gesterf het! Daar het ons potte vol vleis en al die brood gehad wat ons wou hê!’ Hulle het al vergeet hoe verskriklik slawerny was, en hoe magtig God was.",
          "God kon kwaad geword het, maar Hy was eerder vrygewig. ‘Ek sal brood uit die hemel vir julle laat reën,’ het Hy vir Moses gesê. Daardie aand het swerms kwartels die kamp bedek, sodat hulle vleis gehad het. Die volgende oggend, toe die dou opdroog, was die grond bedek met dun wit vlokkies soos ryp. ‘Wat is dit?’ het die mense gevra. In Hebreeus is dit ‘man hoe?’, toe noem hulle dit manna. Dit het gesmaak soos koekies met heuning.",
          "God het eenvoudige opdragte gegee: maak net genoeg vir elke mens vir een dag bymekaar. Party mense het God nie vertrou nie, toe hou hulle ekstra oor tot die volgende dag. Die oggend was dit vol wurms en het dit vreeslik gestink! Maar op die sesde dag het God gesê hulle moet dubbel bymekaarmaak, sodat hulle op die Sabbat kon rus, en daardie manna het vars gebly. Veertig jaar lank het God nie een oggend oorgeslaan nie.",
          "Hoekom net genoeg vir een dag? Omdat God sy mense geleer het om elke dag op Hom staat te maak, soos kinders wat hulle pa vertrou om kos op die tafel te sit. Dit is hoekom Jesus ons geleer het om te bid: ‘Gee ons vandag ons daaglikse brood.’",
          "Later het Jesus iets wonderliks gesê: ‘Ek is die brood van die lewe. Wie na My toe kom, sal nooit honger kry nie.’ Die manna het mense vir een dag aan die lewe gehou. Jesus gee vir ons ’n lewe saam met God wat vir altyd hou.",
        ],
        verse: simple("My God sal in al julle behoeftes voorsien.", "Filippense 4:19"),
        lessons: ["God is ons Voorsiener: Hy gee vir sy kinders wat hulle nodig het.", "God wil hê ons moet elke dag op Hom staatmaak, soos kinders ’n goeie pa vertrou.", "Jesus is die brood van die lewe wat vir ons ’n lewe saam met God gee, vir altyd."],
        questions: ["Hoekom het die manna sleg geword as mense ekstra gehou het?", "Hoekom dink jy het God net genoeg vir een dag op ’n slag gegee?", "Wat kon die Israeliete gedoen het in plaas daarvan om te kla toe hulle honger was? Wat kan jy doen as jy oor iets bekommerd is?"],
        listen: "Wees stil en vra God: ‘Wat het ek vandag van U nodig?’ Luister. Sê dan vir Hom dankie dat Hy dit klaar weet en omgee.",
        prayer: ["Vader, dankie dat U elke dag vir my gee wat ek nodig het, soos…", "Help my om U te vertrou in plaas daarvan om te kla.", "Dankie dat Jesus die brood van die lewe is."],
        mission: { compass: "talk", text: "Sê môre voor elke ete dankie vir God vir jou kos. En as jy agterkom jy kla, verander dit in ’n dankie." },
        journal: "Maak twee kolomme: ‘Dinge wat ek nodig het’ en ‘Dinge wat ek graag wil hê’. Wat sien jy raak? Sê dankie vir God vir alles op die eerste lys.",
      }),
    },
  },

  /* ---------------- Night 12: The Ten Commandments ---------------- */
  "j01-n12": {
    "2-3": {
      en: toddler({
        title: "God’s Good Rules", bibleStory: "Exodus 20",
        story: ["God’s people came to a big mountain. Boom, boom went the thunder!", "God gave Moses ten good rules, written on stone.", "Love God. Love your mommy and daddy. Be kind. Tell the truth.", "God gave good rules because He loves His children.", "We obey God because we love Him too!"],
        verse: simple("God is good.", "Psalm 34:8"),
        action: "Make thunder by drumming on your legs. Then count to ten on your fingers for God’s ten good rules.",
        lessons: ["God’s rules are good, because He loves me."],
        questions: ["What is one way you can be kind tomorrow?"],
        prayer: ["Dear God,", "I love you. Help me to be kind. Amen."],
      }),
      af: toddler({
        title: "God se Goeie Reëls", bibleStory: "Eksodus 20",
        story: ["God se mense het by ’n groot berg gekom. Boem, boem het die donder gegaan!", "God het vir Moses tien goeie reëls gegee, op klip geskryf.", "Het God lief. Het jou mamma en pappa lief. Wees gaaf. Praat die waarheid.", "God het goeie reëls gegee omdat Hy sy kinders liefhet.", "Ons luister na God omdat ons Hom ook liefhet!"],
        verse: simple("God is goed.", "Psalm 34:9"),
        action: "Maak donder deur op jou bene te tromme. Tel dan tot tien op jou vingers vir God se tien goeie reëls.",
        lessons: ["God se reëls is goed, want Hy is lief vir my."],
        questions: ["Hoe kan jy môre gaaf wees?"],
        prayer: ["Liewe God,", "ek is lief vir U. Help my om gaaf te wees. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Rescued First, Then Rules", bibleStory: "Exodus 19 – 20", readPassage: "Exodus 20:1–17",
        story: [
          "Three months after leaving Egypt, the Israelites camped at the foot of Mount Sinai. Thunder rumbled, lightning flashed, a thick cloud covered the mountain, and a trumpet blast grew louder and louder. The whole mountain shook. God was about to speak to His people.",
          "Before giving a single rule, God said this: ‘I am the Lord your God, who brought you out of Egypt, out of the land of slavery.’ Don’t miss the order! God didn’t say, ‘Keep these rules, and then I will rescue you.’ He rescued them first, while they were still grumbling slaves. The rules came afterwards, to show a rescued, loved people how to live as God’s family.",
          "Then God gave the Ten Commandments. The first four are about loving God: have no other gods; don’t worship idols; honour God’s name; keep the Sabbath day holy. The last six are about loving people: honour your father and mother; do not murder; be faithful in marriage; do not steal; do not lie about others; do not want what belongs to someone else.",
          "God’s commandments are not a list of ways to earn His love. They are like the guardrails on a mountain road: they keep us safe and show us the good way. A loving father gives his children rules because he loves them, not so that they can make him love them.",
          "Later, someone asked Jesus which commandment is the greatest. Jesus answered: ‘Love the Lord your God with all your heart and with all your soul and with all your mind… and love your neighbour as yourself.’ All the commandments hang on love. And Jesus said, ‘If you love me, keep my commands.’ We obey not to be accepted, but because we already are, and we love Him.",
        ],
        verse: simple("Taste and see that the Lord is good.", "Psalm 34:8"),
        lessons: ["God rescued His people first, then gave them His good commandments.", "God’s commandments show us how to love Him and love others.", "We obey God because we love Him, not to earn His love. He already loves us."],
        questions: ["What did God say right before He gave the Ten Commandments? Why is that order important?", "Which commandments are about loving God, and which are about loving people?", "Is there one of God’s commandments that is hard for you? How could loving God help you with it?"],
        listen: "Be still and ask God: ‘Which of your good ways do you want to help me with this week?’ Listen. God’s answer won’t sound like a scary telling-off. It will sound like a loving Father helping His child.",
        prayer: ["Father, thank you that you loved me and rescued me first.", "Help me to obey you because I love you, especially with…", "Thank you that your ways are good."],
        mission: { compass: "trust", text: "Tomorrow, show God you love Him: say a happy ‘yes’ the first time a parent asks you to do something." },
        journal: "Draw two tablets of stone. On the first, write ‘Love God’ and three ways you can do it. On the second, write ‘Love others’ and three ways you can do it.",
      }),
      af: older({
        title: "Eers Gered, Dan Reëls", bibleStory: "Eksodus 19 – 20", readPassage: "Eksodus 20:1–17",
        story: [
          "Drie maande nadat hulle uit Egipte vertrek het, het die Israeliete aan die voet van die berg Sinai kamp opgeslaan. Donder het gerommel, weerlig het geflits, ’n dik wolk het die berg bedek, en ’n trompet het al hoe harder geblaas. Die hele berg het geskud. God was op die punt om met sy mense te praat.",
          "Voordat God een enkele reël gegee het, het Hy dit gesê: ‘Ek is die Here jou God wat jou uit Egipte gebring het, uit die land waar jy ’n slaaf was.’ Moenie die volgorde mis nie! God het nie gesê: ‘Hou hierdie reëls, dan sal Ek julle red nie.’ Hy het hulle eers gered, terwyl hulle nog klaende slawe was. Die reëls het daarna gekom, om ’n geredde, geliefde volk te wys hoe om as God se familie te lewe.",
          "Toe gee God die Tien Gebooie. Die eerste vier gaan oor God liefhê: moenie ander gode hê nie; moenie afgode aanbid nie; eer God se naam; hou die Sabbat heilig. Die laaste ses gaan oor mense liefhê: eer jou pa en jou ma; moenie moord pleeg nie; wees getrou in die huwelik; moenie steel nie; moenie leuens oor ander vertel nie; moenie hê wat aan iemand anders behoort nie.",
          "God se gebooie is nie ’n lys van maniere om sy liefde te verdien nie. Hulle is soos die relings langs ’n bergpad: hulle hou ons veilig en wys ons die goeie pad. ’n Liefdevolle pa gee vir sy kinders reëls omdat hy hulle liefhet, nie sodat hulle hom kan laat liefhê nie.",
          "Later het iemand vir Jesus gevra watter gebod die grootste is. Jesus het geantwoord: ‘Jy moet die Here jou God liefhê met jou hele hart en met jou hele siel en met jou hele verstand… en jou naaste soos jouself.’ Al die gebooie hang aan liefde. En Jesus het gesê: ‘As julle My liefhet, sal julle my gebooie hou.’ Ons gehoorsaam nie om aanvaar te word nie, maar omdat ons klaar aanvaar is, en omdat ons Hom liefhet.",
        ],
        verse: simple("Proe en sien dat die Here goed is.", "Psalm 34:9"),
        lessons: ["God het sy mense eers gered, en hulle toe sy goeie gebooie gegee.", "God se gebooie wys ons hoe om Hom en ander lief te hê.", "Ons gehoorsaam God omdat ons Hom liefhet, nie om sy liefde te verdien nie. Hy het ons klaar lief."],
        questions: ["Wat het God gesê net voordat Hy die Tien Gebooie gegee het? Hoekom is daardie volgorde belangrik?", "Watter gebooie gaan oor God liefhê, en watter gaan oor mense liefhê?", "Is daar een van God se gebooie wat vir jou moeilik is? Hoe kan om God lief te hê jou daarmee help?"],
        listen: "Wees stil en vra God: ‘Met watter van u goeie paaie wil U my hierdie week help?’ Luister. God se antwoord sal nie soos ’n bangmaak-raas klink nie. Dit sal klink soos ’n liefdevolle Vader wat sy kind help.",
        prayer: ["Vader, dankie dat U my eerste liefgehad en gered het.", "Help my om U te gehoorsaam omdat ek U liefhet, veral met…", "Dankie dat u paaie goed is."],
        mission: { compass: "trust", text: "Wys môre vir God jy is lief vir Hom: sê die eerste keer bly ‘ja’ as ’n ouer jou vra om iets te doen." },
        journal: "Teken twee kliptafels. Skryf op die eerste ‘Het God lief’ en drie maniere hoe jy dit kan doen. Skryf op die tweede ‘Het ander lief’ en drie maniere hoe jy dit kan doen.",
      }),
    },
  },

  /* ---------------- Night 13: Jericho ---------------- */
  "j01-n13": {
    "2-3": {
      en: toddler({
        title: "The Walls Fall Down", bibleStory: "Joshua 6",
        story: ["There was a city with big, big walls.", "God said, ‘March around the city.’ Stomp, stomp, stomp!", "They marched for seven days.", "Then the trumpets went TOOOT! And everybody shouted!", "CRASH! The walls fell down! God did what He said."],
        verse: simple("Trust God with all your heart.", "Proverbs 3:5"),
        action: "March around the room. Stomp, stomp! Blow a pretend trumpet, TOOOT! Then fall down: CRASH!",
        lessons: ["I can trust God. He does what He says."],
        questions: ["Can you make a trumpet sound?"],
        prayer: ["Dear God,", "I trust you. Amen."],
      }),
      af: toddler({
        title: "Die Mure Val Om", bibleStory: "Josua 6",
        story: ["Daar was ’n stad met groot, groot mure.", "God het gesê: ‘Marsjeer om die stad.’ Stamp, stamp, stamp!", "Hulle het sewe dae lank gemarsjeer.", "Toe blaas die trompette TOETOEET! En almal skree!", "KRAAK! Die mure het omgeval! God het gedoen wat Hy gesê het."],
        verse: simple("Vertrou God met jou hele hart.", "Spreuke 3:5"),
        action: "Marsjeer om die kamer. Stamp, stamp! Blaas ’n kamma-trompet, TOETOEET! Val dan om: KRAAK!",
        lessons: ["Ek kan God vertrou. Hy doen wat Hy sê."],
        questions: ["Kan jy ’n trompetgeluid maak?"],
        prayer: ["Liewe God,", "ek vertrou U. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "The Strangest Battle Plan", bibleStory: "Joshua 6", readPassage: "Joshua 6:1–5, 15–20",
        story: [
          "After forty years in the desert, God’s people finally stood at the edge of the land God had promised them. Moses had died, and God had chosen Joshua to lead them. God told Joshua, ‘Be strong and courageous. Do not be afraid, for the Lord your God will be with you wherever you go.’",
          "But right in the way stood Jericho, a city with massive walls and gates locked tight. The people inside were terrified of Israel’s God, but they weren’t going to open those gates.",
          "God gave Joshua a battle plan that made no sense from the outside. No ladders. No battering rams. Instead: march around the city once a day for six days, with seven priests blowing ram’s horn trumpets in front of the ark of the covenant. The soldiers must stay completely silent. On the seventh day, march around seven times, then the priests blow a long blast, the people shout, and the walls will fall.",
          "Imagine marching in silence while the people on the walls laughed at you. Day one. Day two. Nothing happened. Day six. Still nothing. But Joshua and the people kept doing exactly what God said.",
          "On the seventh day they marched around seven times. The trumpets sounded, the people shouted, and the walls of Jericho collapsed. Israel went straight in.",
          "Hebrews 11:30 explains it: ‘By faith the walls of Jericho fell.’ Faith isn’t pretending, and it isn’t just feeling sure. Faith is trusting God enough to do what He says, even when it seems strange, and keeping on trusting while nothing seems to be happening yet.",
        ],
        verse: simple("Trust in the Lord with all your heart and do not lean on your own understanding.", "Proverbs 3:5"),
        lessons: ["God can be trusted, even when His ways seem strange to us.", "Faith means doing what God says and continuing to trust Him while we wait.", "The battle belongs to God. Our part is to trust and obey."],
        questions: ["Why do you think God told the soldiers to stay silent while they marched?", "What does Hebrews 11:30 say made the walls fall?", "Is there something God asks you to do that doesn’t make sense to your friends? How can you keep trusting Him?"],
        listen: "Sit quietly. Ask God: ‘Is there a wall in my life you want to bring down?’ Listen, and talk about it with your parent.",
        prayer: ["Lord, I trust you with all my heart.", "Help me to keep trusting you about…", "Thank you that you always keep your word."],
        mission: { compass: "trust", text: "Tomorrow, do one thing God asks in the Bible, even if it feels hard, like being kind to someone who isn’t kind to you." },
        journal: "Draw the walls of Jericho. On each brick, write a worry or a problem. Then write across the picture: ‘By faith the walls fell.’",
      }),
      af: older({
        title: "Die Snaaksste Gevegsplan", bibleStory: "Josua 6", readPassage: "Josua 6:1–5, 15–20",
        story: [
          "Ná veertig jaar in die woestyn het God se mense eindelik aan die rand van die land gestaan wat God aan hulle belowe het. Moses het gesterf, en God het Josua gekies om hulle te lei. God het vir Josua gesê: ‘Wees sterk en moedig. Moenie bang wees nie, want die Here jou God is by jou oral waar jy gaan.’",
          "Maar reg in die pad was Jerigo, ’n stad met reusagtige mure en hekke wat styf gesluit was. Die mense binne was doodbang vir Israel se God, maar hulle sou nie daardie hekke oopmaak nie.",
          "God het vir Josua ’n gevegsplan gegee wat van buite af glad nie sin gemaak het nie. Geen lere nie. Geen stormramme nie. In plaas daarvan: marsjeer ses dae lank een keer per dag om die stad, met sewe priesters wat ramshoringtrompette blaas voor die verbondsark. Die soldate moet heeltemal stil bly. Op die sewende dag, marsjeer sewe keer om, dan blaas die priesters lank, die mense skree, en die mure sal omval.",
          "Stel jou voor jy marsjeer in stilte terwyl die mense op die mure vir jou lag. Dag een. Dag twee. Niks het gebeur nie. Dag ses. Steeds niks. Maar Josua en die mense het aangehou om presies te doen wat God gesê het.",
          "Op die sewende dag het hulle sewe keer om gemarsjeer. Die trompette het geblaas, die mense het geskree, en die mure van Jerigo het ineengestort. Israel het reguit ingegaan.",
          "Hebreërs 11:30 verduidelik dit: ‘Deur die geloof het die mure van Jerigo omgeval.’ Geloof is nie kamma nie, en dit is ook nie net om seker te voel nie. Geloof is om God genoeg te vertrou om te doen wat Hy sê, selfs as dit vreemd lyk, en om aan te hou vertrou terwyl dit lyk of niks nog gebeur nie.",
        ],
        verse: simple("Vertrou op die Here met jou hele hart, en moenie op jou eie verstand staatmaak nie.", "Spreuke 3:5"),
        lessons: ["God kan vertrou word, selfs as sy paaie vir ons vreemd lyk.", "Geloof beteken om te doen wat God sê en aan te hou om Hom te vertrou terwyl ons wag.", "Die geveg behoort aan God. Ons deel is om te vertrou en te gehoorsaam."],
        questions: ["Hoekom dink jy het God vir die soldate gesê om stil te bly terwyl hulle marsjeer?", "Wat sê Hebreërs 11:30 het die mure laat omval?", "Is daar iets wat God jou vra om te doen wat vir jou maats nie sin maak nie? Hoe kan jy aanhou om Hom te vertrou?"],
        listen: "Sit stil. Vra God: ‘Is daar ’n muur in my lewe wat U wil laat omval?’ Luister, en gesels daaroor met jou ouer.",
        prayer: ["Here, ek vertrou U met my hele hart.", "Help my om aan te hou om U te vertrou oor…", "Dankie dat U altyd u woord hou."],
        mission: { compass: "trust", text: "Doen môre een ding wat God in die Bybel vra, selfs al voel dit moeilik, soos om gaaf te wees met iemand wat nie gaaf met jou is nie." },
        journal: "Teken die mure van Jerigo. Skryf op elke baksteen ’n bekommernis of ’n probleem. Skryf dan oor die prent: ‘Deur die geloof het die mure omgeval.’",
      }),
    },
  },

  /* ---------------- Night 14: Campfire ---------------- */
  "j01-n14": {
    "2-3": {
      en: toddler({
        title: "Campfire Night",
        story: ["Well done, little explorer! Let’s sit by the campfire and remember: God kept baby Moses safe. God is special. God opened the sea. God gave bread from the sky. God’s rules are good. The walls fell down!"],
        game: "Rescue actions: float like a basket, push the sea open, pick up bread, march and shout. Mom says the story, you do the action!",
        lessons: [], questions: ["Which story did you like best?"],
        prayer: ["Thank you, God,", "you always save me. Amen."],
      }),
      af: toddler({
        title: "Kampvuuraand",
        story: ["Mooi so, klein ontdekker! Kom ons sit by die kampvuur en onthou: God het baba Moses veilig gehou. God is spesiaal. God het die see oopgemaak. God het brood uit die hemel gegee. God se reëls is goed. Die mure het omgeval!"],
        game: "Reddingsaksies: dryf soos ’n mandjie, druk die see oop, tel brood op, marsjeer en skree. Mamma sê die storie, jy doen die aksie!",
        lessons: [], questions: ["Van watter storie het jy die meeste gehou?"],
        prayer: ["Dankie, God,", "U red my altyd. Amen."],
      }),
    },
    "8-9": {
      en: older({
        title: "Campfire Night: The Great Rescue Road",
        story: ["What a journey! This week God protected a baby in a basket, met Moses in a burning bush, rescued His people through the Passover and the Red Sea, fed them every morning, gave them His good commandments and brought down the walls of Jericho. Every single story is about the God who rescues. And every one points ahead to Jesus, the greatest Rescuer of all."],
        game: "Rescue timeline: write each story on a separate piece of paper (basket, bush, sea, manna, mountain, walls), mix them up, and race your parent to put them in the right order. Then tell one thing each story shows about God.",
        lessons: [],
        questions: ["Which rescue story amazed you most? Why?", "How did the Passover and the manna point to Jesus?", "What has God rescued you from, or helped you through?"],
        prayer: ["God, you are my Rescuer, my Provider and my Protector.", "This week I saw that you…", "Thank you for Jesus, the greatest Rescuer of all."],
        mission: { compass: "listen", text: "Learn Exodus 14:14 by heart and say it to someone in your family." },
        journal: "Write a short thank-you letter to God for a time He rescued or helped you.",
      }),
      af: older({
        title: "Kampvuuraand: Die Groot Reddingspad",
        story: ["Wat ’n reis! Hierdie week het God ’n baba in ’n mandjie beskerm, Moses in ’n brandende bos ontmoet, sy mense deur die Pasga en die Rooi See gered, hulle elke oggend kos gegee, hulle sy goeie gebooie gegee en die mure van Jerigo laat omval. Elke enkele storie gaan oor die God wat red. En elkeen wys vorentoe na Jesus, die grootste Redder van almal."],
        game: "Reddings-tydlyn: skryf elke storie op ’n aparte stukkie papier (mandjie, bos, see, manna, berg, mure), meng hulle op, en kyk wie kan hulle eerste in die regte volgorde sit, jy of jou ouer. Sê dan een ding wat elke storie oor God wys.",
        lessons: [],
        questions: ["Watter reddingstorie het jou die meeste verbaas? Hoekom?", "Hoe het die Pasga en die manna na Jesus gewys?", "Waarvan het God jou al gered, of waardeur het Hy jou gehelp?"],
        prayer: ["God, U is my Redder, my Voorsiener en my Beskermer.", "Hierdie week het ek gesien dat U…", "Dankie vir Jesus, die grootste Redder van almal."],
        mission: { compass: "listen", text: "Leer Eksodus 14:14 uit jou kop en sê dit vir iemand in jou familie." },
        journal: "Skryf ’n kort dankie-brief aan God vir ’n keer toe Hy jou gered of gehelp het.",
      }),
    },
  },
};
