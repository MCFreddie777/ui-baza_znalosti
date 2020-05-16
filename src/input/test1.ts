export default {
    facts: [
        'Peter je rodic Jano',
        'Peter je rodic Vlado',
        'manzelia Peter Eva',
        'Vlado je rodic Maria',
        'Vlado je rodic Viera',
        'muz Peter',
        'muz Jano',
        'muz Vlado',
        'zena Maria',
        'zena Viera',
        'zena Eva',
    ],
    rules: [
        {
            name: 'DruhyRodic1',
            if: ['?X je rodic ?Y', 'manzelia ?X ?Z'],
            then: ['pridaj ?Z je rodic ?Y'],
        },
        {
            name: 'DruhyRodic2',
            if: ['?X je rodic ?Y', 'manzelia ?Z ?X'],
            then: ['pridaj ?Z je rodic ?Y'],
        },
        {
            name: 'Otec',
            if: ['?X je rodic ?Y', 'muz ?X'],
            then: ['pridaj ?X je otec ?Y'],
        },
        {
            name: 'Matka',
            if: ['?X je rodic ?Y', 'zena ?X'],
            then: ['pridaj ?X je matka ?Y'],
        },
        {
            name: 'Surodenci',
            if: ['?X je rodic ?Y', '?X je rodic ?Z', '<> ?Y ?Z'],
            then: ['pridaj ?Y a ?Z su surodenci'],
        },
        {
            name: 'Brat',
            if: ['?Y a ?Z su surodenci', 'muz ?Y'],
            then: ['pridaj ?Y je brat ?Z'],
        },
        {
            name: 'Stryko',
            if: ['?Y je brat ?Z', '?Z je rodic ?X'],
            then: ['pridaj ?Y je stryko ?X', 'sprava ?X ma stryka'],
        },
        {
            name: 'Test mazania',
            if: ['?Y je stryko ?X', 'zena ?X'],
            then: ['vymaz zena ?X'],
        },
    ],
};
