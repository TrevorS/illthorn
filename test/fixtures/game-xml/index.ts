// ABOUTME: Test fixture data for game XML parsing validation
// ABOUTME: Real Gemstone IV XML samples for parser compatibility testing

/**
 * Game XML test data organized by category
 */
export const GameXMLTestData = {
  vitals: {
    basic: '<progressBar id="health" text="health 100" value="100" />',
    injured: '<progressBar id="health" text="health 45" value="45" />',
    fullSet: `<progressBar id="health" text="health 85" value="85" />
<progressBar id="mana" text="mana 92" value="92" />
<progressBar id="stamina" text="stamina 78" value="78" />
<progressBar id="spirit" text="spirit 100" value="100" />
<progressBar id="mindState" text="clear" value="100" />`,
    stance: '<progressBar id="pbarStance" text="offensive forward" value="80" />',
    encumbrance: '<progressBar id="encumlevel" text="heavy" value="85" />',
    zero: '<progressBar id="stamina" text="stamina 0" value="0" />',
  },

  spells: {
    singleSpell: `<dialogData id="Active Spells">
  <progressBar id="spell1" text="Mass Blur" time="60" value="100" />
</dialogData>`,
    multipleSpells: `<dialogData id="Active Spells">
  <progressBar id="spell1" text="Bless" time="120" value="80" />
  <progressBar id="spell2" text="Spirit Defense" time="45" value="90" />
  <progressBar id="spell3" text="Heroism" time="300" value="60" />
</dialogData>`,
    empty: `<dialogData id="Active Spells">
</dialogData>`,
    cooldowns: `<dialogData id="Cooldowns">
  <progressBar id="cooldown1" text="Warrior's Resolve" time="600" value="25" />
  <progressBar id="cooldown2" text="Surge of Strength" time="180" value="75" />
</dialogData>`,
    buffs: `<dialogData id="Buffs">
  <progressBar id="buff1" text="Gift of Eonak" time="180" value="90" />
  <progressBar id="buff2" text="Elemental Bias" time="240" value="65" />
</dialogData>`,
  },

  rooms: {
    simple: `<style id="" />You are standing in a small wooden cabin. The walls are lined with rough-hewn planks.
<style id="" />Obvious exits: <d>north</d>, <d>south</d>, <d>east</d>`,
    withCharacters: `<style id="" />This is the town square of Wehnimer's Landing.
<style id="" />Also here: <a exist="player">Adventurer Bob</a>, <a exist="player">Wizard Alice</a>
<style id="" />Obvious exits: <d>north</d>, <d>south</d>, <d>east</d>, <d>west</d>`,
    withFormatting: `<style id="" />
<b>Moonstone Creek Bridge</b>
<style id="" />The wooden bridge spans a gentle creek that flows beneath with a soft babbling sound.`,
    withStreams: `<pushStream id="room" />
<style id="" />
<b>Temple Courtyard</b>
<style id="" />This peaceful courtyard is surrounded by marble columns.
<popStream />`,
  },

  malformed: {
    unclosedTag: '<progressBar id="health" text="health 85" value="85"',
    missingBracket: '<progressBar id="mana" text="mana 92" value="92" /',
    invalidAttributes: '<progressBar id=health text="health 85" value="85" />',
    mixedQuotes: '<progressBar id="health" text=\'health 85" value="85" />',
    strayCharacters: '<progressBar id="health" text="health 85" value="85" />}',
    nestedUnclosed: `<dialogData id="Active Spells">
  <progressBar id="spell1" text="Heroism" time="300" value="60"
  <progressBar id="spell2" text="Bless" time="120" value="80" />
</dialogData>`,
  },

  misc: {
    pushBoldPopBold: "<pushBold/>Important text<popBold/>",
    prompt: '<prompt time="1234567890">></prompt>',
    notification: "<notification>You have received a message</notification>",
    mixed: `<style id="" />Some text <b>bold text</b> more text
<progressBar id="health" text="health 85" value="85" />
<d>north</d> <a exist="player">Player Name</a>`,
  },
};

/**
 * Large XML samples for performance testing
 */
export const PerformanceTestData = {
  /**
   * Generate large spell list for performance testing
   */
  generateLargeSpellList(count: number): string {
    let xml = '<dialogData id="Active Spells">\n';
    for (let i = 1; i <= count; i++) {
      xml += `  <progressBar id="spell${i}" text="Spell ${i}" time="${Math.floor(Math.random() * 3600)}" value="${Math.floor(Math.random() * 100)}" />\n`;
    }
    xml += "</dialogData>";
    return xml;
  },

  /**
   * Generate large room description for performance testing
   */
  generateLargeRoomDescription(characterCount: number, itemCount: number): string {
    let xml = '<style id="" />This is a large room with many occupants and items scattered about.\n';

    xml += '<style id="" />Also here: ';
    for (let i = 1; i <= characterCount; i++) {
      xml += `<a exist="player">Character${i}</a>`;
      if (i < characterCount) xml += ", ";
    }
    xml += "\n";

    xml += '<style id="" />Obvious items: ';
    for (let i = 1; i <= itemCount; i++) {
      xml += `<a exist="item">item${i}</a>`;
      if (i < itemCount) xml += ", ";
    }
    xml += "\n";

    xml += '<style id="" />Obvious exits: <d>north</d>, <d>south</d>, <d>east</d>, <d>west</d>';
    return xml;
  },
};
