/* ============================================================
   Vincent in Arles — site data
   All quotes verbatim from the Van Gogh Letters project
   (Van Gogh Museum & Huygens ING, vangoghletters.org, CC BY-NC-SA 4.0).
   Letter IDs match vangoghletters.org/orig/let{n}.
   Paintings: public domain, via Wikimedia Commons.
   ============================================================ */

const CHAPTERS = [
  {
    id: "arrival",
    kicker: "Chapter One · February 1888",
    title: "The Snow of the South",
    painting: "pink-peach.jpg",
    paintingTitle: "The Pink Peach Tree (Souvenir de Mauve), March 1888",
    text: [
      "Vincent stepped off the train on 20 February 1888, expecting the sun of Japan. Arles greeted him with sixty centimetres of snow.",
      "He was thirty-four. He had left Paris exhausted — by the noise, by the arguments, by himself. In the south he wanted three things: colour, cheap light-filled rooms, and a brotherhood of painters that did not yet exist anywhere except in his head.",
      "Within weeks the snow melted, and the orchards detonated into blossom. He painted them almost faster than they could flower — and when word came that his teacher Anton Mauve had died, he signed the tenderest of the orchard canvases 'Souvenir de Mauve' and sent it home."
    ],
    quote: "During the journey I thought at least as much about you as about the new country I was seeing.",
    quoteSource: "To Theo, 21 February 1888 — Letter 577"
  },
  {
    id: "studio",
    kicker: "Chapter Two · Spring – Summer 1888",
    title: "A Studio of the South",
    painting: "harvest.jpg",
    paintingTitle: "The Harvest (La Crau), June 1888",
    text: [
      "The heat came, and with it a kind of furious happiness. Wheatfields, the plain of La Crau, the little bridge at Langlois where the washerwomen knelt — he worked outdoors in the mistral, pinning his easel down with iron pegs.",
      "In May he rented four rooms in a yellow house on Place Lamartine: two francs fifty a week, no furniture, all hope. It was to be the 'Studio of the South', and the first guest he wanted was Paul Gauguin.",
      "While he waited for Gauguin's answer, he began a decoration for the house. Not saints, not myths — sunflowers. A dozen canvases of nothing but large sunflowers, light on light, yellow on yellow."
    ],
    quote: "I'm painting with the gusto of a Marseillais eating bouillabaisse — and it won't surprise you that it's a question of painting large Sunflowers.",
    quoteSource: "To Theo, 21–22 August 1888 — Letter 666"
  },
  {
    id: "night",
    kicker: "Chapter Three · September 1888",
    title: "Painting the Night",
    painting: "cafe-terrace.jpg",
    paintingTitle: "Café Terrace at Night (Place du Forum), September 1888",
    text: [
      "September belonged to the dark. He set up his easel on the cobbles of the Place du Forum, and then on the bank of the Rhône, and painted the night — on the spot, by gaslight, some say with candles fixed to his hat.",
      "What he found was a heresy and a discovery at once: the night is not black. The night is violet, royal blue, green-bronze; a gas flame is sulphur-yellow; a star is not white but a small explosion of rose and green.",
      "He wrote it all down for his sister and his brother — colour by colour, like a recipe — which is why, more than any other paintings in history, we know exactly what these ones looked like inside his head."
    ],
    quote: "It often seems to me that the night is even more richly coloured than the day, coloured in the most intense violets, blues and greens. … Now there's a painting of night without black.",
    quoteSource: "To Willemien, 9 and 16 September 1888 — Letter 678"
  },
  {
    id: "gauguin",
    kicker: "Chapter Four · 23 October – 23 December 1888",
    title: "Two Painters, One House",
    painting: "bedroom.jpg",
    paintingTitle: "The Bedroom, October 1888",
    text: [
      "Gauguin arrived before dawn on 23 October and waited in the all-night café until it was a decent hour to knock. For nine weeks the Studio of the South was real: two easels, one small house, gas light in the studio so they could work at night.",
      "They painted the same subjects side by side — the Alyscamps, the vineyards, Madame Ginoux — and argued about everything: memory against observation, Paris against the south, who owed what to whom.",
      "The house strained under two large temperaments. On the evening of 23 December, in a crisis that has been retold too many times and understood too little, Vincent mutilated his own left ear. Gauguin left for Paris. The nine weeks were over — but the paintings from those weeks never stopped talking to each other."
    ],
    quote: "If Gauguin and I work every evening for a fortnight, won't we earn it all back again?",
    quoteSource: "To Theo, October 1888 — Letter 709",
    sensitive: true
  },
  {
    id: "courtyard",
    kicker: "Chapter Five · January – May 1889",
    title: "The Courtyard and the Road",
    painting: "hospital-courtyard.jpg",
    paintingTitle: "The Courtyard of the Hospital at Arles, April 1889",
    text: [
      "What survives from the hardest winter of his life is, above all, composure. Ten days after the crisis he wrote to Theo from the hospital office — not to ask for pity, but to cancel it.",
      "He was cared for by a 23-year-old intern, Félix Rey, whose portrait he painted in thanks. He went back to the yellow house, was petitioned against by frightened neighbours, returned to the hospital, and painted its courtyard garden — flowering, orderly, serene — from the middle of his own storm.",
      "On 8 May 1889 he left Arles for the asylum at Saint-Rémy, by his own decision, with a crate of canvases that included the Sunflowers, the Bedroom and the Night Café. Fifteen months, roughly two hundred paintings, and a new colour of night that the world has never quite recovered from."
    ],
    quote: "Now I ask just one thing of you: not to worry — for that would cause me one worry too many.",
    quoteSource: "To Theo, from the hospital, 2 January 1889 — Letter 728",
    sensitive: true
  }
];

/* ---- "His Words as Colour" — Starry Night Over the Rhône, Letter 691 ---- */
const COLOR_STORY = {
  painting: "starry-rhone.jpg",
  paintingTitle: "Starry Night Over the Rhône, September 1888 — Musée d'Orsay",
  intro: "On 29 September 1888 Vincent sent Theo a sketch of a canvas he had just painted on the riverbank at night, 'actually painted at night, under a gas-lamp'. Then he did something painters almost never do: he wrote the palette down, colour by colour. Every swatch below is his own sentence.",
  quoteSource: "To Theo, 29 September 1888 — Letter 691",
  chips: [
    { hex: "#2A5E6C", label: "The sky is green-blue" },
    { hex: "#1D3A6E", label: "the water is royal blue" },
    { hex: "#9A7BA8", label: "the areas of land are mauve" },
    { hex: "#43518D", label: "the town is blue" },
    { hex: "#5C4272", label: "…and violet" },
    { hex: "#F4C430", label: "the gaslight is yellow" },
    { hex: "#C87F3B", label: "its reflections are red gold" },
    { hex: "#6E7B3F", label: "…down to green bronze" },
    { hex: "#8FBC8B", label: "the Great Bear, a green sparkle" },
    { hex: "#E7A9C4", label: "…and pink" }
  ]
};

/* ---- Map of Arles ---- */
const MAP_CENTER = [43.6772, 4.6285];
const PLACES = [
  {
    coords: [43.67907, 4.63106],
    name: "The Yellow House",
    sub: "2 Place Lamartine",
    painting: "yellow-house.jpg",
    note: "Four rooms, rented May 1888 — the 'Studio of the South'. Vincent slept here, Gauguin stayed nine weeks here. The building was destroyed by bombing in 1944; the painting is now its only address."
  },
  {
    coords: [43.67650, 4.62785],
    name: "Café Terrace",
    sub: "Place du Forum",
    painting: "cafe-terrace.jpg",
    note: "Painted at night, on the spot, in September 1888 — 'a painting of night without black'. The café still stands on the square."
  },
  {
    coords: [43.68035, 4.62555],
    name: "Bank of the Rhône",
    sub: "Starry Night viewpoint",
    painting: "starry-rhone.jpg",
    note: "A two-minute walk from the yellow house. Here he painted the gaslit river and the Great Bear — and wrote the palette to Theo in Letter 691."
  },
  {
    coords: [43.65878, 4.62061],
    name: "The Langlois Bridge",
    sub: "today 'Pont Van-Gogh'",
    painting: "langlois-bridge.jpg",
    note: "A small drawbridge on the canal south of town, where the washerwomen worked. It reminded him of Holland; he painted and drew it many times in spring 1888."
  },
  {
    coords: [43.67471, 4.62700],
    name: "The Hôtel-Dieu Hospital",
    sub: "now Espace Van Gogh",
    painting: "hospital-courtyard.jpg",
    note: "Where he was cared for by Dr Félix Rey after December 1888, and where he painted the flowering courtyard in April 1889. The garden has been replanted to match the painting."
  },
  {
    coords: [43.67397, 4.63344],
    name: "Les Alyscamps",
    sub: "Roman necropolis",
    painting: null,
    note: "An avenue of ancient sarcophagi under autumn poplars — the first subject Vincent and Gauguin painted side by side, in late October 1888."
  },
  {
    coords: [43.67766, 4.63104],
    name: "The Arena",
    sub: "Les Arènes d'Arles",
    painting: null,
    note: "A Roman amphitheatre, still in use. Vincent went for the crowd, not the bullfight — he painted the spectators."
  }
];

/* ---- The Protagonist ---- */
const VINCENT = {
  name: "Vincent van Gogh",
  dates: "Groot-Zundert 1853 — Auvers-sur-Oise 1890",
  img: "bandaged-ear.jpg",
  imgTitle: "Self-Portrait with Bandaged Ear — Arles, January 1889 · The Courtauld, London. Painted within weeks of the crisis, back at the easel, a Japanese print pinned on the wall behind him.",
  paras: [
    "By the time he reached Arles he had already failed at everything respectable: art dealing in The Hague and London, teaching in England, preaching to coal miners in the Borinage. He did not touch a brush seriously until he was twenty-seven. He had eight years left, and seemed to know it — no painter has ever worked faster on purpose.",
    "In Arles he was thirty-five: red-haired, sunburnt, living on bread, coffee and absinthe, spending everything Theo sent on paint. In fifteen months he produced around two hundred paintings, over a hundred drawings, and the 173 letters this site is built from — a body of work per week that most painters would call a good year.",
    "The portrait on the left was painted in January 1889, within weeks of the night he cut his own ear. He is back in the yellow house, back in his winter coat, and — above all — back at the easel, a Japanese print pinned on the wall behind him. It is not a picture of a broken man; it is a man showing his brother that he has picked up the brush again."
  ],
  quote: "Now I'm planning to do Mr Rey's portrait, and possibly other portraits, as soon as I've accustomed myself a little to painting once again.",
  quoteSource: "To Theo, the day he came home from hospital, 7 January 1889 — Letter 732"
};

/* ---- The People ---- */
const PEOPLE = [
  {
    name: "Theo van Gogh",
    role: "Brother · art dealer · lifeline",
    img: "theo.jpg",
    imgNote: "Photograph, c. 1888",
    note: "Four years younger, and the only person Vincent never stopped writing to: 129 of the 173 Arles letters are addressed to him. From his desk at Boussod & Valadon in Paris he sent 150–250 francs a month — paint, canvas, rent, the two beds for the yellow house — in exchange for every canvas Vincent finished. He rushed to Arles by night train when the crisis came, and got engaged to Johanna Bonger that same winter. Their son, born 1890, was christened Vincent Willem."
  },
  {
    name: "Paul Gauguin",
    role: "Painter · housemate for nine weeks",
    img: "gauguin-by-bernard.jpg",
    imgNote: "As Émile Bernard sketched him, in the self-portrait sent to Vincent — 1888",
    note: "A forty-year-old former stockbroker and sailor, magnetic and unsentimental — mentioned in 116 Arles letters, more than anyone else. Theo brokered the deal: 150 francs a month for one painting. He arrived on 23 October 1888, took over the cooking and the accounts, painted Vincent painting sunflowers, and left on Christmas Eve after the catastrophe. From the hospital Vincent still asked after him — 'Tell Gauguin to write to me, and that I'm still thinking of him.'"
  },
  {
    name: "Joseph Roulin",
    role: "Postal supervisor · loyal friend",
    img: "roulin.jpg",
    imgNote: "Portrait by Van Gogh, 1888 · Getty Museum",
    note: "Not strictly a postman but the entrepôseur at the railway station — a big-bearded republican of forty-seven who drank well, argued politics, and refused to be paid for posing. Vincent painted the whole family, some twenty-five canvases: Joseph six times, his wife Augustine as the rocking 'Berceuse', the boys Armand and Camille, the baby Marcelle. After 23 December it was Roulin who steadied Vincent, walked him home from the hospital, and wrote the letters to Theo that Vincent could not."
  },
  {
    name: "Marie Ginoux",
    role: "Café owner · 'L'Arlésienne'",
    img: "arlesienne.jpg",
    imgNote: "L'Arlésienne, 1888 · Musée d'Orsay",
    note: "With her husband Joseph she kept the Café de la Gare at 30 Place Lamartine, where Vincent lodged for months and painted The Night Café — the room he said was a place 'where one could go mad'. In early November 1888 she sat for both painters in a single session: Gauguin made a charcoal drawing, Vincent claims he put her onto canvas 'in three-quarters of an hour'. Her dark Arlésienne profile became one of his most repeated images — he painted her again from memory in Saint-Rémy."
  },
  {
    name: "Dr Félix Rey",
    role: "Hospital intern · aged 23",
    img: "dr-rey.jpg",
    imgNote: "Portrait by Van Gogh, January 1889 · Pushkin Museum",
    note: "The young house physician of the Hôtel-Dieu, fresh from medical school in Montpellier, who treated Vincent after the crisis and — rarer still — treated him as sane company: he explained the diagnosis, tolerated an easel on the ward, and let him paint the courtyard. Vincent thanked him with this portrait as a New Year's gift. The Rey family never liked it; for years it plugged a hole in their chicken coop. It is now in the Pushkin Museum, Moscow, worth more than the hospital ever was."
  },
  {
    name: "Émile Bernard",
    role: "Painter · correspondent · aged 20",
    img: "bernard-by-gauguin.jpg",
    imgNote: "As Gauguin painted him, in the 'Les Misérables' self-portrait sent to Vincent — 1888",
    note: "Twenty years old, precocious and argumentative, painting in Brittany beside Gauguin. Vincent sent him 20 letters from Arles — the most technical ones, full of colour theory, perspective frames, and blunt career advice. In October 1888 the three men exchanged self-portraits at Vincent's request, Japanese-style, each dedicating his face to the others. Bernard repaid the friendship after Vincent's death: he organised the first retrospective and was the first to publish the letters."
  },
  {
    name: "Willemien van Gogh",
    role: "Youngest sister · the gentlest letters",
    img: "willemien.jpg",
    imgNote: "Photograph, undated",
    note: "Wil was twenty-six, at home with their widowed mother in Breda, curious about books and about her strange brother's art. The 9 letters she received from Arles are the tenderest of the whole correspondence — it was to her that Vincent first explained that the night is more richly coloured than the day, and to her he sent novels by Maupassant and advice to 'eat well and be as cheerful as possible'. She kept everything; the letters survived partly thanks to her."
  }
];
