// Squishy names. Little Maker picks from PRESET_NAMES; Big Maker can also type a name,
// which is only accepted if every word is in ALLOWED_WORDS (an allow-list, not a block-list).
export const PRESET_NAMES = [
  'Mochi', 'Bubbles', 'Sprinkles', 'Jelly Bean', 'Cupcake', 'Marshmallow', 'Peachy', 'Boba',
  'Gummy', 'Twinkle', 'Coco', 'Sugar Pie', 'Pudding', 'Waffles', 'Noodle', 'Cookie',
  'Snowball', 'Pebbles', 'Honey', 'Button', 'Cloud', 'Pickle', 'Muffin', 'Dumpling',
]

const EXTRA_WORDS = `
thalia little big tiny mini super mega baby mama papa happy sunny sleepy silly giggly wiggly jiggly squishy squishie
squishies cutie cute sweet soft fluffy puffy bouncy sparkly glitter glittery shiny star stars starry moon sun rainbow
sky cloudy rain snow snowy flower flowers rose daisy lily blossom petal berry berries cherry strawberry blueberry
lemon lime orange peach mango apple banana melon watermelon grape kiwi coconut candy lolly lollipop sugar cake pie
cookie cookies cream ice tea milk honey jam toast bun buns bean beans pea nugget nut pancake cocoa caramel vanilla
mint minty fizz fizzy pop popcorn sprinkle gum bubblegum taffy fudge treat treats dream dreamy wish magic fairy
pixie unicorn dragon kitty kitten cat puppy pup dog bunny bun lamb sheep bear teddy panda fox frog froggy duck
duckling chick owl bee bug ladybug butterfly fish whale dolphin seal penguin axolotl hamster mouse piggy pig cow
pony horse deer hedgehog koala sloth otter turtle snail jelly jellyfish octopus pink red blue green yellow purple
lilac lavender aqua teal mint gold golden silver white rosy peachy pastel the of and my mister miss lady sir queen
king prince princess captain doctor professor best friend buddy pal love lovely heart hearts hug hugs kiss boop
bop zoom zip pip pom pompom poppy pickles button buttons pebble snuggle snuggles cuddle cuddles nap nappy noodle
`

export const ALLOWED_WORDS = new Set([
  ...PRESET_NAMES.flatMap((n) => n.toLowerCase().split(' ')),
  ...EXTRA_WORDS.split(/\s+/).filter(Boolean),
])

export const MAX_NAME_LENGTH = 20

export function isAllowedName(text) {
  const name = text.trim().replace(/\s+/g, ' ')
  if (!name || name.length > MAX_NAME_LENGTH || !/^[A-Za-z ]+$/.test(name)) return false
  return name.split(' ').every((w) => ALLOWED_WORDS.has(w.toLowerCase()))
}

// Tidy capitalization: "jelly bean" → "Jelly Bean".
export const tidyName = (text) =>
  text
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
