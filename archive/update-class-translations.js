const initSqlJs = require('sql.js');
const fs = require('fs');

// 正确的职业翻译映射
const CLASS_MAP = {
  'adept': '导师',
  'alchemist': '炼金术士',
  'antipaladin': '反圣武士',
  'arcanist': '奥术师',
  'bard': '吟游诗人',
  'bloodrager': '血脉狂怒者',
  'brawler': '拳师',
  'cleric': '牧师',
  'druid': '德鲁伊',
  'fighter': '战士',
  'gunslinger': '铳士',
  'hunter': '猎人',
  'inquisitor': '审判者',
  'investigator': '调查员',
  'magus': '魔战士',
  'medium': '通灵师',
  'mesmerist': '催眠师',
  'monk': '武僧',
  'ninja': '忍者',
  'occultist': '秘学士',
  'oracle': '先知',
  'paladin': '圣武士',
  'psychic': '异能者',
  'ranger': '游侠',
  'rogue': '盗贼',
  'samurai': '武士',
  'shaman': '萨满',
  'skald': '歌者',
  'sorcerer': '术士',
  'summoner': '召唤师',
  'summonerUnchained': '召唤师（Unchained）',
  'swashbuckler': '游荡剑客',
  'witch': '女巫',
  'wizard': '法师',
  'warpriest': '战斗祭司',
  'kineticist': '操念使',
  'spiritualist': '灵媒师',
  'champion': '勇士'
};

async function updateClassTranslations() {
  console.log("更新数据库中的职业翻译...");

  const SQL = await initSqlJs();
  const buf = fs.readFileSync('spells.db');
  const db = new SQL.Database(buf);

  // 获取所有不同的职业
  const classesResult = db.exec('SELECT DISTINCT class_name FROM spell_classes ORDER BY class_name');

  if (classesResult.length === 0) {
    console.log("没有找到职业数据");
    db.close();
    return;
  }

  const classes = classesResult[0].values.map(row => row[0]);
  console.log(`找到 ${classes.length} 个不同的职业`);

  let updateCount = 0;
  for (const className of classes) {
    const correctTranslation = CLASS_MAP[className];
    if (!correctTranslation) {
      console.log(`⚠️  未找到翻译: ${className}`);
      continue;
    }

    // 更新数据库中的翻译
    db.run(`UPDATE spell_classes SET class_name_cn = ? WHERE class_name = ?`, [correctTranslation, className]);
    updateCount++;
    console.log(`✅ ${className} -> ${correctTranslation}`);
  }

  console.log(`\n✅ 已更新 ${updateCount} 个职业的翻译`);

  // 验证结果
  const verifyResult = db.exec(`
    SELECT DISTINCT class_name, class_name_cn
    FROM spell_classes
    ORDER BY class_name
  `);

  if (verifyResult.length > 0) {
    console.log("\n验证结果（前10个）:");
    verifyResult[0].values.slice(0, 10).forEach(row => {
      console.log(`✅ ${row[0]} -> ${row[1]}`);
    });
  }

  // 保存数据库
  const dbData = db.export();
  fs.writeFileSync('spells.db', dbData);
  console.log("\n✅ 数据库已更新");

  db.close();
}

updateClassTranslations().catch(console.error);