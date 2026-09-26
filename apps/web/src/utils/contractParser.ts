export interface ParseContractResult {
  date: string | null; // ISO YYYY-MM-DD
  rawSnippet?: string;
  confidence: 'high' | 'medium' | 'low';
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1, იანვარი: 1, იან: 1,
  feb: 2, february: 2, თებერვალი: 2, თებ: 2,
  mar: 3, march: 3, მარტი: 3, მარ: 3,
  apr: 4, april: 4, აპრილი: 4, აპრ: 4,
  may: 5, მაისი: 5, მაი: 5,
  jun: 6, june: 6, ივნისი: 6, ივნ: 6,
  jul: 7, july: 7, ივლისი: 7, ივლ: 7,
  aug: 8, august: 8, აგვისტო: 8, აგვ: 8,
  sep: 9, september: 9, სექტემბერი: 9, სექ: 9,
  oct: 10, october: 10, ოქტომბერი: 10, ოქტ: 10,
  nov: 11, november: 11, ნოემბერი: 11, ნოე: 11,
  dec: 12, december: 12, დეკემბერი: 12, დეკ: 12
};

function pad(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 2020 || year > 2045) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/**
 * Searches extracted text for contract expiration date
 */
function findDateInText(text: string): ParseContractResult {
  if (!text || text.trim().length === 0) {
    return { date: null, confidence: 'low' };
  }

  // Look for keywords indicating contract end / expiration
  const keywordRegex = /(?:valid\s+until|expiry\s+date|expiration\s+date|contract\s+end(?:ing)?|end\s+date|terminates?\s+on|term\s+ends?|period\s+until|duration\s+until|მოქმედების\s+ვადა|დასრულების\s+თარიღი|კონტრაქტის\s+ვადა|ვადა[:\s]|until[:\s])([^\n\r;.]{1,60})/gi;
  
  let match: RegExpExecArray | null;
  const candidates: { date: string; snippet: string; score: number }[] = [];

  while ((match = keywordRegex.exec(text)) !== null) {
    const snippet = match[1];
    const parsed = parseDateString(snippet);
    if (parsed) {
      candidates.push({ date: parsed, snippet: match[0], score: 10 });
    }
  }

  // If a keyword-adjacent date is found, return the best candidate
  if (candidates.length > 0) {
    return {
      date: candidates[0].date,
      rawSnippet: candidates[0].snippet.trim(),
      confidence: 'high'
    };
  }

  // Fallback: search the entire document for future date patterns
  // 1. ISO YYYY-MM-DD
  const isoMatch = text.match(/\b(202[5-9]|203\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (isValidDate(y, m, d)) {
      return { date: `${y}-${pad(m)}-${pad(d)}`, rawSnippet: isoMatch[0], confidence: 'medium' };
    }
  }

  // 2. DD.MM.YYYY or DD/MM/YYYY (common European / Georgian format)
  const euroMatches = text.matchAll(/\b(0[1-9]|[12]\d|3[01])[./-](0[1-9]|1[0-2])[./-](202[5-9]|203\d)\b/g);
  for (const m of euroMatches) {
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    if (isValidDate(y, mo, d)) {
      return { date: `${y}-${pad(mo)}-${pad(d)}`, rawSnippet: m[0], confidence: 'medium' };
    }
  }

  return { date: null, confidence: 'low' };
}

/**
 * Parses date fragments found near keywords
 */
function parseDateString(str: string): string | null {
  if (!str) return null;

  // Pattern: YYYY-MM-DD
  const iso = str.match(/\b(202[4-9]|203\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (iso) {
    const y = parseInt(iso[1], 10);
    const m = parseInt(iso[2], 10);
    const d = parseInt(iso[3], 10);
    if (isValidDate(y, m, d)) return `${y}-${pad(m)}-${pad(d)}`;
  }

  // Pattern: DD.MM.YYYY or DD/MM/YYYY
  const euro = str.match(/\b(0?[1-9]|[12]\d|3[01])[./-](0?[1-9]|1[0-2])[./-](202[4-9]|203\d)\b/);
  if (euro) {
    const d = parseInt(euro[1], 10);
    const m = parseInt(euro[2], 10);
    const y = parseInt(euro[3], 10);
    if (isValidDate(y, m, d)) return `${y}-${pad(m)}-${pad(d)}`;
  }

  // Pattern: Month DD, YYYY or DD Month YYYY (e.g. December 31, 2027)
  const words = str.toLowerCase().replace(/[,:]/g, ' ').split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (MONTH_MAP[w]) {
      const month = MONTH_MAP[w];
      // Check surrounding tokens for day and year
      const prev = words[i - 1];
      const next1 = words[i + 1];
      const next2 = words[i + 2];

      // Format: DD Month YYYY
      if (prev && next1) {
        const d = parseInt(prev, 10);
        const y = parseInt(next1, 10);
        if (isValidDate(y, month, d)) return `${y}-${pad(month)}-${pad(d)}`;
      }

      // Format: Month DD YYYY
      if (next1 && next2) {
        const d = parseInt(next1, 10);
        const y = parseInt(next2, 10);
        if (isValidDate(y, month, d)) return `${y}-${pad(month)}-${pad(d)}`;
      }
    }
  }

  return null;
}

/**
 * Extracts contract expiry date from uploaded File
 */
export async function extractContractExpiryDate(file: File): Promise<ParseContractResult> {
  try {
    const fileName = file.name.toLowerCase();

    // Also check if filename itself has an expiration date, e.g. "Contract_until_2027-12-31.pdf"
    const fromFilename = parseDateString(fileName);

    let extractedText = '';

    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { extractText } = await import('unpdf');
        const result = await extractText(arrayBuffer);
        if (Array.isArray(result.text)) {
          extractedText = result.text.join(' ');
        } else if (typeof result.text === 'string') {
          extractedText = result.text;
        }
      } catch (err) {
        console.warn('PDF text extraction fallback: ', err);
      }
    } else if (
      fileName.endsWith('.txt') ||
      fileName.endsWith('.csv') ||
      fileName.endsWith('.md') ||
      file.type.startsWith('text/')
    ) {
      extractedText = await file.text();
    }

    // Try finding date in extracted text
    const textResult = findDateInText(extractedText);
    if (textResult.date) {
      return textResult;
    }

    // If text extraction yielded nothing, check filename date
    if (fromFilename) {
      return {
        date: fromFilename,
        rawSnippet: file.name,
        confidence: 'medium'
      };
    }

    return { date: null, confidence: 'low' };
  } catch (error) {
    console.error('Failed to extract contract expiry date:', error);
    return { date: null, confidence: 'low' };
  }
}
