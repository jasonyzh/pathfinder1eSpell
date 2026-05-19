const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const initSqlJs = require("sql.js");

const PORT = 8080;
const DIR = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

let db = null;

function jsonRes(res, data) {
  const body = JSON.stringify(data);
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function querySpells(sql, params) {
  const stmt = db.prepare(sql);
  stmt.bind(params || []);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function handleAPI(req, res, pathname, params) {
  if (pathname === "/api/filters") {
    const classes = querySpells("SELECT DISTINCT class_name, class_name_cn FROM spell_classes ORDER BY class_name");
    const schools = querySpells("SELECT DISTINCT school_cn FROM spells WHERE school_cn != '' ORDER BY school_cn");
    jsonRes(res, { classes, schools: schools.map(r => r.school_cn) });
    return;
  }

  if (pathname === "/api/spells") {
    const search = (params.search || "").trim().toLowerCase();
    const classList = params.classes ? params.classes.split(",").map(s => s.trim()).filter(Boolean) : [];
    const schoolList = params.schools ? params.schools.split(",").map(s => s.trim()).filter(Boolean) : [];
    const levelList = params.levels ? params.levels.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
    const page = parseInt(params.page || "1");
    const pageSize = parseInt(params.pageSize || "200");

    let sql = "SELECT s.id, s.name, s.translated_name, s.school_cn, s.subschool, s.types_cn, s.level FROM spells s";
    const conds = [];
    const pvals = [];

    if (classList.length) {
      sql += " INNER JOIN spell_classes sc ON s.id = sc.spell_id";
      const ph = classList.map(() => "?").join(",");
      conds.push("sc.class_name IN (" + ph + ")");
      pvals.push(...classList);
      if (classList.length > 1) {
        conds.push("s.id IN (SELECT spell_id FROM spell_classes WHERE class_name IN (" + ph + ") GROUP BY spell_id HAVING COUNT(DISTINCT class_name) = ?)");
        pvals.push(...classList, classList.length);
      }
    }
    if (levelList.length) {
      if (!classList.length) {
        sql += " INNER JOIN spell_classes sc2 ON s.id = sc2.spell_id";
      }
      const lvPh = levelList.map(() => "?").join(",");
      const lvCond = (classList.length ? "sc" : "sc2") + ".level IN (" + lvPh + ")";
      if (classList.length) {
        conds.push("s.id IN (SELECT spell_id FROM spell_classes WHERE class_name IN (" + classList.map(() => "?").join(",") + ") AND level IN (" + lvPh + "))");
        pvals.push(...classList, ...levelList);
      } else {
        conds.push(lvCond);
        pvals.push(...levelList);
      }
    }
    if (schoolList.length) {
      const parts = schoolList.map(() => "?").join(",");
      conds.push("(s.school_cn IN (" + parts + ") OR " + schoolList.map(() => "s.subschool LIKE '%' || ? || '%'").join(" OR ") + ")");
      pvals.push(...schoolList, ...schoolList);
    }
    if (search) {
      conds.push("(LOWER(s.name) LIKE ? OR LOWER(s.translated_name) LIKE ?)");
      pvals.push("%" + search + "%", "%" + search + "%");
    }

    if (conds.length) sql += " WHERE " + conds.join(" AND ");
    sql += " GROUP BY s.id";

    let countSql = "SELECT COUNT(*) as total FROM (" + sql + ")";
    const totalRow = querySpells(countSql, pvals);
    const total = totalRow[0] ? totalRow[0].total : 0;

    sql += " ORDER BY s.level, s.name LIMIT ? OFFSET ?";
    pvals.push(pageSize, (page - 1) * pageSize);

    const spells = querySpells(sql, pvals);

    const spellIds = spells.map(s => s.id);
    if (spellIds.length) {
      const ph = spellIds.map(() => "?").join(",");
      const classRows = querySpells("SELECT spell_id, class_name AS name, class_name_cn, level FROM spell_classes WHERE spell_id IN (" + ph + ")", spellIds);
      const classMap = {};
      for (const r of classRows) {
        if (!classMap[r.spell_id]) classMap[r.spell_id] = [];
        classMap[r.spell_id].push({ name: r.name, class_name_cn: r.class_name_cn, level: r.level });
      }
      for (const s of spells) s.classes = classMap[s.id] || [];
    }

    jsonRes(res, { total, page, pageSize, spells });
    return;
  }

  if (pathname === "/api/spell") {
    const id = params.id || "";
    const rows = querySpells("SELECT * FROM spells WHERE id = ?", [id]);
    if (!rows.length) { res.writeHead(404); res.end("Not found"); return; }
    const sp = rows[0];

    sp.classes = querySpells("SELECT class_name AS name, class_name_cn, level FROM spell_classes WHERE spell_id = ?", [id]);
    sp.actions = querySpells("SELECT name, activation_en, activation_cn, target_en, target, duration_en, duration, saving_throw_en, saving_throw, area, effect_en, effect, range_en, range_cn FROM spell_actions WHERE spell_id = ?", [id]);
    sp.domains = querySpells("SELECT type, name, level FROM spell_domains WHERE spell_id = ?", [id]);

    // 添加原文URL提取
    if (sp.short_description) {
      const urlMatch = sp.short_description.match(/https?:\/\/[^\s<]+/);
      sp.original_url = urlMatch ? urlMatch[0].trim() : "";
    }

    jsonRes(res, sp);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
}

async function start() {
  console.log("Loading spells.db...");
  const SQL = await initSqlJs();
  const buf = fs.readFileSync(path.join(DIR, "spells.db"));
  db = new SQL.Database(buf);
  const cnt = querySpells("SELECT COUNT(*) as c FROM spells");
  console.log("Loaded", cnt[0].c, "spells from database.");

  http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;
    const params = parsed.query;

    if (pathname.startsWith("/api/")) {
      try { handleAPI(req, res, pathname, params); }
      catch (e) { console.error("API Error:", e); res.writeHead(500); res.end(e.message); }
      return;
    }

    let fp = pathname === "/" ? "/index.html" : pathname;
    const full = path.join(DIR, fp);
    if (!full.startsWith(DIR)) { res.writeHead(403); res.end(); return; }
    fs.readFile(full, (err, data) => {
      if (err) { res.writeHead(404); res.end("Not Found"); return; }
      const ext = path.extname(full).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
    });
  }).listen(PORT, () => console.log("Server: http://localhost:" + PORT));
}

start().catch(e => { console.error(e); process.exit(1); });
