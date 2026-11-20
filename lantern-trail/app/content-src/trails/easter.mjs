/**
 * Seasonal trail: Easter. 8 nights, Palm Sunday to Easter Sunday (see src/lib/schedule.ts).
 * Band texts live in content-src/easter-*.mjs and are merged by scripts/convert-prototypes.mjs.
 */
const v = (en, enRef, af, afRef) => ({ en: { text: en, refText: enRef, wording: "simple" }, af: { text: af, refText: afRef, wording: "simple" } });
const t = (enGem, afGem, enTrait, afTrait) => ({ gem: { en: enGem, af: afGem }, trait: { en: enTrait, af: afTrait } });
const story = (id, scene, treasure) => ({ id, kind: "story", scene, treasure });
const camp = (id, scene) => ({ id, kind: "campfire", scene });

export default {
  id: "easter", kind: "seasonal", season: "easter", order: 0,
  title: { en: "The Road to the Empty Tomb", af: "Die Pad na die Leë Graf" },
  blurb: {
    en: "Walk through the most important week in history with Jesus: from palm branches to a garden at dawn.",
    af: "Stap saam met Jesus deur die belangrikste week in die geskiedenis: van palmtakke tot by ’n tuin met dagbreek.",
  },
  expeditions: [
    {
      id: "easter-e1", color: 3,
      title: { en: "The Week That Changed Everything", af: "Die Week wat Alles Verander het" },
      blurb: {
        en: "A King on a donkey, children singing in the temple, a jar of perfume, bread and a cup, a garden prayer, a cross, a quiet Saturday and an empty tomb.",
        af: "’n Koning op ’n donkie, kinders wat in die tempel sing, ’n fles parfuum, brood en ’n beker, ’n gebed in ’n tuin, ’n kruis, ’n stil Saterdag en ’n leë graf.",
      },
      memoryVerse: v("He is not here; He has risen, just as He said.", "Matthew 28:6", "Hy is nie hier nie; Hy het opgestaan, soos Hy gesê het.", "Matteus 28:6"),
      nights: [
        story("easter-n1", "day town walls ; 🌿80,150,40 🫏200,158,48 🌿320,150,40", t("Humble King", "Nederige Koning", "Jesus is a humble King who comes in peace", "Jesus is ’n nederige Koning wat in vrede kom")),
        story("easter-n2", "day town walls ; 🕊️110,110,28 🧒230,166,36 🎶290,110,26", t("House of Prayer", "Huis van Gebed", "God welcomes everyone to come close and praise Him", "God verwelkom almal om naby te kom en Hom te prys")),
        story("easter-n3", "sunset town ; 🏺160,166,32 👩230,164,38 ✨200,100,24", t("Worthy", "Waardig", "Jesus is worth my very best", "Jesus is my allerbeste werd")),
        story("easter-n4", "night town ; 🍞150,166,30 🍷200,164,30 🕯️260,160,28", t("Remember Me", "Onthou My", "Jesus gave Himself for me", "Jesus het Homself vir my gegee")),
        story("easter-n5", "night garden tree ; 🙏170,166,40 🫒240,160,24", t("Your Will", "U Wil", "Jesus obeyed the Father because He loves Him", "Jesus het die Vader gehoorsaam omdat Hy Hom liefhet")),
        story("easter-n6", "storm hills cross ; 🤍200,40,20", t("Way Open", "Pad Oop", "Through the cross I can come close to God", "Deur die kruis kan ek naby God kom")),
        camp("easter-n7", "night campfire ; 🔥200,165,54 🪨320,166,34"),
        story("easter-n8", "dawn garden tomb ; 👼120,110,36 🌸320,162,26 ✨280,90,22", t("Alive!", "Lewendig!", "Jesus is alive, and death is defeated", "Jesus leef, en die dood is oorwin")),
      ],
    },
  ],
};
