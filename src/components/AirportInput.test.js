import { describe, expect, it } from 'vitest';
import { search } from './AirportInput';

const mk = (code, name, city, iso, type = 'L') => {
  const country = iso;
  return {
    code, name, city, iso, type, country,
    label: `${city} - ${name}`,
    codeL: code.toLowerCase(),
    cityL: city.toLowerCase(),
    nameL: name.toLowerCase(),
    countryL: country.toLowerCase(),
  };
};

const all = [
  mk('DEL', 'Indira Gandhi International Airport', 'Delhi', 'IN'),
  mk('BOM', 'Chhatrapati Shivaji International Airport', 'Mumbai', 'IN'),
  mk('JFK', 'John F Kennedy International Airport', 'New York', 'US'),
];

describe('airport search', () => {
  it('ranks an exact code match first', () => {
    const results = search(all, 'del');
    expect(results[0].code).toBe('DEL');
  });

  it('matches a city name prefix', () => {
    const results = search(all, 'mumbai');
    expect(results.map((r) => r.code)).toContain('BOM');
  });

  it('finds nothing for an unrelated query', () => {
    expect(search(all, 'zzz-no-match')).toHaveLength(0);
  });

  it('returns the popular list, in POPULAR order, for an empty query', () => {
    const results = search(all, '');
    expect(results.map((r) => r.code)).toEqual(['BOM', 'DEL', 'JFK']);
  });
});
