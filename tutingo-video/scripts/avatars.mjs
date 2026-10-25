// Generates the teacher avatars (DiceBear "avataaars", offline) into public/avatars/.
import {writeFileSync} from 'node:fs';
import {createAvatar} from '@dicebear/core';
import {avataaars} from '@dicebear/collection';

const base = {
	eyes: ['happy'],
	mouth: ['smile'],
	eyebrows: ['defaultNatural'],
	radius: 50,
	backgroundType: ['solid'],
};

const teachers = {
	yassine: {
		top: ['shortFlat'],
		hairColor: ['2c1b18'],
		facialHair: ['beardLight'],
		facialHairColor: ['2c1b18'],
		facialHairProbability: 100,
		skinColor: ['d08b5b'],
		clothing: ['blazerAndShirt'],
		clothesColor: ['25557c'],
		accessoriesProbability: 0,
		backgroundColor: ['c9b6ff'],
	},
	salma: {
		top: ['hijab'],
		hatColor: ['672edf'],
		skinColor: ['edb98a'],
		clothing: ['blazerAndSweater'],
		clothesColor: ['e6e6e6'],
		facialHairProbability: 0,
		accessoriesProbability: 0,
		backgroundColor: ['ffc8e0'],
	},
	karim: {
		top: ['shortCurly'],
		hairColor: ['4a312c'],
		skinColor: ['ae5d29'],
		clothing: ['collarAndSweater'],
		clothesColor: ['3c4f5c'],
		accessories: ['prescription02'],
		accessoriesColor: ['262e33'],
		accessoriesProbability: 100,
		facialHairProbability: 0,
		backgroundColor: ['b6e3ff'],
	},
};

for (const [name, opts] of Object.entries(teachers)) {
	const svg = createAvatar(avataaars, {...base, ...opts, seed: name}).toString();
	writeFileSync(new URL(`../public/avatars/${name}.svg`, import.meta.url), svg);
	console.log(name);
}
