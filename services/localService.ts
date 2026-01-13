import { UserInput, GenerationResponse, AnalysisResponse, Gender } from "../types";
import { calculateBaZi, calculateWuxingBasic } from "./baziCalculator";

// --- Static Data for System Logic ---

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// Expanded Data Sources (Packed to save space)
// Format: Char/Pinyin/Wuxing/Meaning
const RAW_CHAR_DATA = `
沐/mù/水/沐浴恩泽，洗涤心灵|清/qīng/水/清正廉洁，如水清澈|泽/zé/水/恩泽深厚，福润万物|浩/hào/水/浩然正气，胸怀广阔|海/hǎi/水/海纳百川，心胸宽广|洋/yáng/水/洋洋得意，前程远大
深/shēn/水/深谋远虑，学问精深|涵/hán/水/内涵丰富，修养深厚|淑/shū/水/贤良淑德，温婉善良|淳/chún/水/淳朴善良，质朴自然|润/rùn/水/温润如玉，福泽绵长|洁/jié/水/冰清玉洁，品行高尚
林/lín/木/生机勃勃，郁郁葱葱|森/sēn/木/繁荣昌盛，稳重深沉|松/sōng/木/坚韧不拔，长寿吉祥|柏/bǎi/木/岁寒松柏，品格高洁|栋/dòng/木/栋梁之材，堪当大任|梁/liáng/木/国家栋梁，中流砥柱
权/quán/木/权衡利弊，掌权理事|杰/jié/木/英雄豪杰，才智出众|荣/róng/木/繁荣富贵，光宗耀祖|桦/huà/木/正直高洁，坚韧挺拔|楠/nán/木/珍贵木材，坚固耐用|楷/kǎi/木/楷模典范，为人师表
烨/yè/火/光辉灿烂，前程似锦|煜/yù/火/照耀四方，明亮温暖|炎/yán/火/热情洋溢，蒸蒸日上|阳/yáng/火/阳光开朗，积极向上|灿/càn/火/灿烂夺目，光彩照人|灵/líng/火/机智灵敏，心灵手巧
烁/shuò/火/闪烁光芒，才华横溢|烽/fēng/火/烽火燎原，气势磅礴|焕/huàn/火/焕然一新，精神饱满|炜/wěi/火/光明磊落，光辉灿烂|炫/xuàn/火/光彩夺目，才华出众|熠/yì/火/熠熠生辉，光彩照人
轩/xuān/土/气宇轩昂，高贵典雅|宇/yǔ/土/气度不凡，胸怀宇宙|安/ān/土/安居乐业，幸福安康|辰/chén/土/星辰大海，希望无限|远/yuǎn/土/志存高远，前程远大|岩/yán/土/坚如磐石，意志坚定
坤/kūn/土/厚德载物，宽厚仁慈|磊/lěi/土/光明磊落，心地坦荡|伟/wéi/土/伟岸高大，成就非凡|崇/chóng/土/崇高尊贵，受人敬仰|圣/shèng/土/超凡入圣，品德高尚|均/jūn/土/雷霆万钧，势不可挡
锦/jǐn/金/前程似锦，华丽尊贵|铭/míng/金/铭记于心，才华横溢|瑞/ruì/金/祥瑞之兆，吉祥如意|诚/chéng/金/诚实守信，金石为开|锋/fēng/金/锋芒毕露，锐意进取|锐/ruì/金/锐不可当，目光敏锐
钟/zhōng/金/钟灵毓秀，才情出众|钧/jūn/金/雷霆万钧，位高权重|钰/yù/金/珍宝美玉，坚硬刚强|鑫/xīn/金/多金多福，财源广进|镇/zhèn/金/镇定自若，稳如泰山|鉴/jiàn/金/明镜高悬，洞察秋毫
云/yún/水/闲云野鹤，逍遥自在|雨/yǔ/水/春风化雨，润物无声|冰/bīng/水/冰雪聪明，纯洁无暇|源/yuán/水/源远流长，生生不息|溪/xī/水/涓涓细流，清澈见底|渊/yuān/水/学识渊博，深不可测
枫/fēng/木/枫林如火，热情奔放|楚/chǔ/木/楚楚动人，清晰明朗|桐/tóng/木/梧桐栖凤，高贵吉祥|柳/liǔ/木/杨柳依依，身姿曼妙|果/guǒ/木/硕果累累，成就斐然|标/biāo/木/标新立异，出类拔萃
迅/xùn/火/迅速敏捷，雷厉风行|显/xiǎn/火/显赫尊贵，声名远扬|昌/chāng/火/繁荣昌盛，光明美好|昂/áng/火/昂首挺胸，气宇轩昂|明/míng/火/光明磊落，聪明睿智|昕/xīn/火/旭日东升，希望初现
城/chéng/土/众志成城，坚固可靠|基/jī/土/根基稳固，事业有成|坚/jiān/土/坚韧不拔，意志坚定|墨/mò/土/文人墨客，博学多才|堂/táng/土/堂堂正正，相貌堂堂|尧/yáo/土/帝王之才，德高望重
钦/qīn/金/钦佩敬重，恭敬顺从|刚/gāng/金/刚正不阿，坚强刚毅|毅/yì/金/毅力顽强，果断坚决|铮/zhēng/金/铁骨铮铮，刚正不阿|银/yín/金/富贵吉祥，纯洁高雅|铎/duó/金/警钟长鸣，声名远播
博/bó/水/博学多才，胸怀广阔|文/wén/水/文质彬彬，才华横溢|豪/háo/水/豪情壮志，气度不凡|民/mín/水/悲天悯人，心系苍生|平/píng/水/平步青云，平平安安|弘/hóng/水/弘扬正气，气势恢宏
艺/yì/木/多才多艺，技艺精湛|英/yīng/木/英姿飒爽，才智过人|兰/lán/木/蕙质兰心，高雅纯洁|苏/sū/木/万物复苏，生机盎然|若/ruò/木/虚怀若谷，大智若愚|萌/méng/木/充满希望，生机勃勃
智/zhì/火/足智多谋，才华横溢|腾/téng/火/飞黄腾达，奋发向上|朗/lǎng/火/豁达开朗，神清气爽|晋/jìn/火/加官进爵，步步高升|知/zhī/火/知书达理，见多识广|伦/lún/火/绝世无伦，无与伦比
圣/shèng/土/超凡入圣，品德高尚|佳/jiā/土/才子佳人，美好出众|唯/wéi/土/独一无二，不可替代|阅/yuè/土/阅历丰富，见识广博|堪/kān/土/堪当重任，足以胜任|勇/yǒng/土/勇往直前，无所畏惧
修/xiū/金/修身养性，品行高洁|信/xìn/金/信守承诺，一诺千金|承/chéng/金/承前启后，继承发扬|尚/shàng/金/崇尚高雅，品德高尚|初/chū/金/不忘初心，纯真善良|千/qiān/金/千里之志，前程远大
`;

// Build DB
const CHAR_DB = RAW_CHAR_DATA.trim().split(/[\n|]/).map(line => {
  const [char, pinyin, wuxing, meaning] = line.trim().split('/');
  return { char, pinyin, wuxing, meaning };
}).filter(c => c.char);

const RAW_POEMS = `
昔我往矣，杨柳依依。|青青子衿，悠悠我心。|呦呦鹿鸣，食野之苹。|桃之夭夭，灼灼其华。|如月之恒，如日之升。|高山仰止，景行行止。
靡不有初，鲜克有终。|天行健，君子以自强不息。|地势坤，君子以厚德载物。|关关雎鸠，在河之洲。|窈窕淑女，君子好逑。|所谓伊人，在水一方。
蒹葭苍苍，白露为霜。|一日不见，如三秋兮。|投我以木瓜，报之以琼琚。|知我者，谓我心忧。|不知我者，谓我何求。|风雨如晦，鸡鸣不已。
青青河畔草，郁郁园中柳。|行行重行行，与君生别离。|人生天地间，忽如远行客。|对酒当歌，人生几何？|譬如朝露，去日苦多。|山不厌高，海不厌深。
周公吐哺，天下归心。|采菊东篱下，悠然见南山。|山气日夕佳，飞鸟相与还。|海内存知己，天涯若比邻。|无为在歧路，儿女共沾巾。|前不见古人，后不见来者。
念天地之悠悠，独怆然而涕下。|海上生明月，天涯共此时。|长风破浪会有时，直挂云帆济沧海。|天生我材必有用，千金散尽还复来。|俱怀逸兴壮思飞，欲上青天揽明月。
抽刀断水水更流，举杯消愁愁更愁。|两岸猿声啼不住，轻舟已过万重山。|飞流直下三千尺，疑是银河落九天。|朝辞白帝彩云间，千里江陵一日还。|明月出天山，苍茫云海间。
但使龙城飞将在，不教胡马度阴山。|黄河远上白云间，一片孤城万仞山。|羌笛何须怨杨柳，春风不度玉门关。|国破山河在，城春草木深。|感时花溅泪，恨别鸟惊心。
烽火连三月，家书抵万金。|白头搔更短，浑欲不胜簪。|会当凌绝顶，一览众山小。|露从今夜白，月是故乡明。|谁言寸草心，报得三春晖。
慈母手中线，游子身上衣。|野火烧不尽，春风吹又生。|春蚕到死丝方尽，蜡炬成灰泪始干。|身无彩凤双飞翼，心有灵犀一点通。|相见时难别亦难，东风无力百花残。
曾经沧海难为水，除却巫山不是云。|春风得意马蹄疾，一日看尽长安花。|疏影横斜水清浅，暗香浮动月黄昏。|小荷才露尖尖角，早有蜻蜓立上头。|接天莲叶无穷碧，映日荷花别样红。
欲把西湖比西子，淡妆浓抹总相宜。|横看成岭侧成峰，远近高低各不同。|不识庐山真面目，只缘身在此山中。|山重水复疑无路，柳暗花明又一村。|落红不是无情物，化作春泥更护花。
人生自古谁无死，留取丹心照汗青。|千磨万击还坚劲，任尔东西南北风。|不要人夸颜色好，只留清气满乾坤。|粉身碎骨浑不怕，要留清白在人间。|纸上得来终觉浅，绝知此事要躬行。
`;
const POEM_DB = RAW_POEMS.trim().split(/[\n|]/).map(p => p.trim()).filter(p => p);

const RAW_MEANINGS = [
  "此名寓意深远，象征着坚韧不拔的意志与高尚的品德。",
  "名字中蕴含着对美好未来的期许，意指人生如旭日东升，充满希望。",
  "字里行间流露出一种温润如玉的气质，象征着待人谦和，处世圆融。",
  "寓意才华横溢，如同璀璨星辰，在人群中闪耀夺目。",
  "象征着胸怀宽广，能容纳万物，具有领袖风范。",
  "寓意生活安康，福泽绵长，一生顺遂无忧。",
  "名字透露出一种清新脱俗的气息，象征着品行高洁，不流于俗。",
  "意指智慧过人，思维敏捷，能够洞察世事。",
  "象征着生命力顽强，如同青松翠柏，历经风雨而更显苍翠。",
  "寓意家庭和睦，事业有成，是福寿双全的吉兆。",
  "名字中包含着对知识的渴望，意指学识渊博，见多识广。",
  "象征着诚信为本，一诺千金，在社会中享有良好声誉。",
  "寓意勇气可嘉，敢于面对挑战，具有开拓进取的精神。",
  "意指心灵手巧，多才多艺，在艺术或技术领域有独特天赋。",
  "象征着性格开朗，乐观向上，能够给周围的人带来正能量。",
  "寓意沉稳踏实，做事有条不紊，值得信赖。",
  "名字中蕴含着仁爱之心，意指乐于助人，积善成德。",
  "象征着前程似锦，事业蒸蒸日上，不断攀登新的高峰。",
  "寓意优雅大方，举止得体，具有良好的教养。",
  "意指意志坚定，不屈不挠，能够克服人生道路上的各种困难。",
  "象征着如水般灵动，适应能力强，善于把握机遇。",
  "寓意如山般稳重，给人以安全感，是团队中的中流砥柱。",
  "名字透露出一种豪迈之气，象征着志向远大，气吞山河。",
  "意指生活富足，衣食无忧，享受丰盛的人生。",
  "象征着纯真善良，保持赤子之心，不受世俗污染。",
  "寓意思维缜密，逻辑清晰，善于分析和解决问题。",
  "意指行动敏捷，效率极高，在事业上能够抢占先机。",
  "象征着公平公正，不偏不倚，具有正直的品格。",
  "寓意温柔体贴，善解人意，家庭生活幸福美满。",
  "意指眼光独到，具有创新精神，能够引领潮流。"
];

const RAW_BALANCE = [
  "八字喜用神得到有效补充，五行流通有情，大吉。",
  "名字五行属性与命理契合，有效平衡了原局的缺失。",
  "五行配置得当，补足了先天命局的短板，有助于运势提升。",
  "字面五行与八字喜用相生，为命主带来了生生不息的能量。",
  "五行相生相克，恰到好处，构建了稳固的命理基础。",
  "名字五行助旺了八字中的弱项，使整体命局更加和谐。",
  "五行流通顺畅，无阻滞之象，预示着人生道路平坦。",
  "名字五行有力地抑制了八字中的忌神，转危为安。",
  "五行搭配精妙，既补足了缺憾，又未造成过犹不及。",
  "名字五行与日主相合，增强了自身的贵人运势。",
  "五行格局开阔，有助于拓展人际关系和事业发展。",
  "名字五行调候得宜，使寒暖燥湿趋于平衡。",
  "五行能量充沛，为命主提供了源源不断的动力。",
  "名字五行稳住了命局根基，使其在风雨中屹立不倒。",
  "五行配置灵动，赋予了命主随机应变的能力。",
  "名字五行增强了财星的力量，预示着财源广进。",
  "五行有助于官星显露，利于职场升迁和名誉获取。",
  "名字五行生旺了印星，利于学业深造和文化修养。",
  "五行使得食伤吐秀，才华得以充分发挥。",
  "名字五行平衡了比劫之气，利于团队合作和财富积累。"
];

// --- Helper Functions ---

// Simple determinstic hash based on input string
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// --- Content Generators ---

const getNameMeaning = (surname: string, name: string): string => {
  const seed = simpleHash(surname + name);
  
  // Try to find exact char matches first
  const chars = name.split('');
  const charMeanings = chars.map(c => CHAR_DB.find(db => db.char === c)?.meaning).filter(Boolean);
  
  if (charMeanings.length > 0) {
    return `此名中，${charMeanings.join("；")}。总体而言，${RAW_MEANINGS[seed % RAW_MEANINGS.length]}`;
  }

  // Fallback to purely hash-based pattern generation
  const adj = ["宏大", "深远", "高雅", "清新", "稳重", "灵动", "坚毅", "温婉", "睿智", "豁达", "纯真", "豪迈", "俊秀", "端庄", "英武", "慈悲", "忠诚", "守信", "勤奋", "谦虚"];
  const noun = ["志向", "情怀", "气度", "风范", "品质", "意境", "前程", "根基", "智慧", "福泽", "心胸", "才华", "德行", "修养", "操守", "威望", "名声", "家风", "学识", "胆识"];
  const verb = ["彰显", "蕴含", "预示", "象征", "体现", "透露", "昭示", "寄托", "展现", "意味着", "包含", "折射", "流露", "表达", "暗合", "契合", "融汇", "贯通", "承载", "弘扬"];
  const obj = ["无限生机", "锦绣前程", "非凡成就", "幸福安康", "栋梁之才", "君子之风", "大家风范", "不屈意志", "卓越才能", "高尚情操", "吉祥如意", "繁荣昌盛", "岁月静好", "太平盛世", "仁义礼智", "忠孝节义", "真善美", "天地正气", "古圣先贤", "美好未来"];

  const i1 = seed % adj.length;
  const i2 = (seed >> 2) % noun.length;
  const i3 = (seed >> 4) % verb.length;
  const i4 = (seed >> 6) % obj.length;

  return `名字寓意${adj[i1]}的${noun[i2]}，${verb[i3]}了${obj[i4]}。${RAW_MEANINGS[seed % RAW_MEANINGS.length]}`;
};

const getWuxingBalance = (missing: string[], nameWuxing: string, seed: number): string => {
  const patterns = [
    "补救有力", "平衡得当", "相得益彰", "恰到好处", "虽有不足但大体平衡", "五行流通", "气机顺畅", "生化有情", "制化得宜", "调候适中"
  ];
  
  const prefix = RAW_BALANCE[seed % RAW_BALANCE.length];
  const suffix = patterns[seed % patterns.length];
  
  const missStr = missing.join("、");
  const specific = `针对八字缺${missStr}的情况，名字中的${nameWuxing}行起到了关键的${suffix}作用。`;
  
  return `${prefix} ${specific}`;
};

const getConclusion = (score: number): string => {
  if (score >= 95) return "天选之名，万中无一。此名格局宏大，五行完美契合，数理大吉，预示一生富贵荣华，名扬四海。";
  if (score >= 90) return "大吉之名，锦上添花。五行配置极佳，寓意深远，有助于事业顺遂，家庭美满，是不可多得的好名字。";
  if (score >= 85) return "吉名高照，顺风顺水。名字与生辰八字配合默契，能有效弥补先天不足，带来稳定的运势。";
  if (score >= 80) return "佳名良配，安稳幸福。五行相对平衡，字义美好，虽无大富大贵之象，但保一生平安喜乐。";
  if (score >= 75) return "中上之选，瑕不掩瑜。名字总体不错，部分五行略有偏差，但不影响整体格局，可以作为优选。";
  if (score >= 70) return "良玉微瑕，平平淡淡。此名中规中矩，五行配合尚可，无大凶大险，适合追求平淡生活之人。";
  if (score >= 65) return "一般之名，需慎重考虑。五行补救力度稍显不足，或字义过于普通，难有助运之效。";
  if (score >= 60) return "勉强可用，建议另选。名字与八字契合度不高，可能造成运势起伏，若无更好选择暂且可用。";
  if (score >= 55) return "格局偏低，不宜采用。五行可能存在冲突，或字义不吉，恐有阻碍发展之虞，建议重新起名。";
  return "下下之选，切勿使用。此名五行严重失衡，或数理大凶，与命主八字背道而驰，恐招致不利。";
};

const calculateNameScore = (surname: string, name: string, birthDate: string): number => {
  const seed = simpleHash(surname + name + birthDate);
  let baseScore = 60 + (seed % 30); // Base 60-90

  // Bonus for Char DB presence
  const chars = name.split('');
  const knownChars = chars.filter(c => CHAR_DB.some(db => db.char === c));
  
  if (knownChars.length > 0) {
    // Boost score by ~10% if chars are in our "good" dictionary
    baseScore = Math.min(99, Math.floor(baseScore * 1.1));
  } else {
    // Small penalty for unknown chars (uncommon might be weird)
    baseScore = Math.max(50, baseScore - 2);
  }

  // Ensure deterministic but seemingly random variation within the range
  if (seed % 7 === 0) baseScore += 5; 
  if (seed % 13 === 0) baseScore -= 3;

  return Math.min(100, Math.max(0, baseScore));
};

/**
 * Generate Names using System Logic (Offline/Algorithmic)
 * @param input User input data
 * @param offset Start index for random seed offset (pagination)
 * @param count Number of names to generate
 */
export const generateNamesLocal = async (input: UserInput, offset: number = 0, count: number = 6): Promise<GenerationResponse> => {
  // Simulate delay for realism
  await new Promise(resolve => setTimeout(resolve, 800));

  // Use Real BaZi
  const bazi = calculateBaZi(input.birthDate, input.birthTime);
  const { distribution, missing } = calculateWuxingBasic(bazi);
  
  const seed = simpleHash(input.surname + input.birthDate);

  // Select characters that match missing element or complement it
  const targetElement = missing[0];
  const compatibleChars = CHAR_DB.filter(c => c.wuxing === targetElement || Math.random() > 0.6); // Bias towards matching
  
  const suggestions = [];
  // Use offset in loop to ensure pagination generates different names
  for (let i = offset; i < offset + count; i++) { 
    // Pick 1 or 2 characters deterministically based on seed + i
    const char1 = compatibleChars[(seed + i * 7) % compatibleChars.length];
    const char2 = CHAR_DB[(seed * i + 11) % CHAR_DB.length];
    
    // 50% chance of single char name if desired, but let's stick to 2 char for consistency mostly
    const isSingle = (seed + i) % 4 === 0;
    
    // Ensure we don't crash if DB is empty (unlikely)
    if (!char1 || !char2) continue;

    const nameStr = isSingle ? char1.char : (char1.char === char2.char ? char1.char + '然' : char1.char + char2.char);
    const wuxingStr = isSingle ? char1.wuxing : `${char1.wuxing}${char2.wuxing}`;
    
    const poem = POEM_DB[(seed + i * 3) % POEM_DB.length];
    
    const score = calculateNameScore(input.surname, nameStr, input.birthDate);
    
    // Meaning Logic
    const meaning = getNameMeaning(input.surname, nameStr);
    
    suggestions.push({
      characters: nameStr,
      pinyin: isSingle ? char1.pinyin : `${char1.pinyin} ${char2.pinyin}`,
      wuxing: wuxingStr,
      score: score,
      poem: poem,
      meaning: meaning,
      luckyAnalysis: getWuxingBalance(missing, wuxingStr, seed + i)
    });
  }

  return {
    bazi,
    missingElements: missing,
    elementDistribution: distribution,
    suggestions
  };
};

/**
 * Analyze Name using System Logic (Offline/Algorithmic)
 */
export const analyzeNameLocal = async (input: UserInput): Promise<AnalysisResponse> => {
  if (!input.name) throw new Error("Name is required");
  await new Promise(resolve => setTimeout(resolve, 800));

  // Use Real BaZi
  const bazi = calculateBaZi(input.birthDate, input.birthTime);
  const { distribution, missing } = calculateWuxingBasic(bazi);
  
  const score = calculateNameScore(input.surname, input.name, input.birthDate);
  const seed = simpleHash(input.surname + input.name);

  // Determine Wuxing of input name (Simulated lookup)
  const nameChars = input.name.split('');
  const wuxingStr = nameChars.map(c => CHAR_DB.find(db => db.char === c)?.wuxing || '金').join('');

  return {
    bazi,
    nameCharacters: input.surname + input.name,
    score,
    baziAnalysis: `生辰八字为${bazi.join(' ')}。五行喜用【${missing.join('')}】。`,
    nameMeaning: getNameMeaning(input.surname, input.name),
    wuxingBalance: getWuxingBalance(missing, wuxingStr, seed),
    elementDistribution: distribution,
    conclusion: getConclusion(score)
  };
};