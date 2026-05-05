/**
 * Snipe Controller
 * Returns curated PSA 9 listings for the demo.
 * In production this would call the eBay Browse API; for now it returns
 * a static set of listings filtered by card name.
 */

const LISTINGS = [
  {
    certNumber: '11223344',
    title: 'PSA 9 Charizard Holo 1st Edition Shadowless Base Set 1999',
    price: '$7,250.00',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Charizard+1st+Edition+Shadowless',
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    seller: 'vintage_cards_co',
    listedDate: '2 hours ago'
  },
  {
    certNumber: '22334455',
    title: 'PSA 9 Charizard Holo Shadowless Base Set 1999 Pokemon',
    price: '$1,599.00',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Charizard+Shadowless+Base+Set',
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    seller: 'pokeauction_pro',
    listedDate: '5 hours ago'
  },
  {
    certNumber: '105739487',
    title: 'PSA 9 Charizard VSTAR Full Art Japanese VSTAR Universe',
    price: '$189.99',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Charizard+VSTAR+Japanese',
    imageUrl: 'https://d1htnxwo4o0jhw.cloudfront.net/cert/173587391/yFgkO2PXEUy6D2e5KiSDFw.jpg',
    seller: 'jpn_card_imports',
    listedDate: '1 hour ago'
  },
  {
    certNumber: '66778899',
    title: 'PSA 9 Charizard V Alt Art Brilliant Stars 154/172',
    price: '$269.50',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Charizard+V+Alt+Art+Brilliant+Stars',
    imageUrl: 'https://images.pokemontcg.io/swsh9/154_hires.png',
    seller: 'modern_grades',
    listedDate: '3 hours ago'
  },
  {
    certNumber: '55667788',
    title: 'PSA 9 Charizard VMAX Rainbow Rare Champions Path 74/73',
    price: '$215.00',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Charizard+VMAX+Rainbow+Rare',
    imageUrl: 'https://images.pokemontcg.io/swsh35/74_hires.png',
    seller: 'rainbow_rares',
    listedDate: '6 hours ago'
  },
  {
    certNumber: '77889900',
    title: 'PSA 9 Rayquaza VMAX Alt Art Evolving Skies 218/203',
    price: '$725.00',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Rayquaza+VMAX+Alt+Art',
    imageUrl: 'https://images.pokemontcg.io/swsh7/218_hires.png',
    seller: 'altart_collector',
    listedDate: '4 hours ago'
  },
  {
    certNumber: '88990011',
    title: 'PSA 9 Giratina V Alt Art Lost Origin 186/196',
    price: '$310.00',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Giratina+V+Alt+Art',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    seller: 'altart_collector',
    listedDate: '7 hours ago'
  },
  {
    certNumber: '33445566',
    title: 'PSA 9 Lugia 1st Edition Holo Neo Genesis 9/111',
    price: '$1,850.00',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Lugia+1st+Edition+Neo+Genesis',
    imageUrl: 'https://images.pokemontcg.io/neo1/9_hires.png',
    seller: 'vintage_cards_co',
    listedDate: '8 hours ago'
  },
  {
    certNumber: '44556677',
    title: 'PSA 9 Umbreon Gold Star POP Series 5 17/17',
    price: '$2,599.00',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Umbreon+Gold+Star',
    imageUrl: 'https://images.pokemontcg.io/pop5/17_hires.png',
    seller: 'goldstar_specialty',
    listedDate: '12 hours ago'
  },
  {
    certNumber: '148000445',
    title: 'PSA 9 Mewtwo VSTAR Full Art Crown Zenith GG44',
    price: '$54.99',
    url: 'https://www.ebay.com/sch/i.html?_nkw=PSA+9+Mewtwo+VSTAR+Crown+Zenith',
    imageUrl: 'https://images.pokemontcg.io/swsh12pt5gg/GG44_hires.png',
    seller: 'crown_zenith_hub',
    listedDate: '30 minutes ago'
  }
];

exports.searchCards = async (req, res) => {
  try {
    const query = (req.query.card || '').trim().toLowerCase();

    const filtered = query
      ? LISTINGS.filter(l => l.title.toLowerCase().includes(query))
      : LISTINGS;

    res.json({
      success: true,
      data: filtered,
      message: filtered.length
        ? `Found ${filtered.length} listing${filtered.length === 1 ? '' : 's'}.`
        : `No PSA 9 listings found for "${query}". Try "Charizard", "Lugia", or leave blank to see all.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
